import os
import json
import base64
import hmac
import hashlib
import requests
from typing import Optional, Dict, Any
from datetime import datetime
from bson import ObjectId
from dotenv import load_dotenv
from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from cryptography.fernet import Fernet, InvalidToken

load_dotenv()

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "freelancekz")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_fernet():
    key = os.getenv("IIN_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("IIN_ENCRYPTION_KEY is not set")
    return Fernet(key)


def get_hash_key():
    key = os.getenv("IIN_HASH_KEY") or os.getenv("IIN_ENCRYPTION_KEY")
    if not key:
        raise RuntimeError("IIN_HASH_KEY or IIN_ENCRYPTION_KEY is not set")
    try:
        return base64.urlsafe_b64decode(key)
    except Exception:
        return key.encode("utf-8")


def encrypt_iin(iin: str) -> str:
    return get_fernet().encrypt(iin.encode("utf-8")).decode("utf-8")


def decrypt_iin(token: str) -> Optional[str]:
    try:
        return get_fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except (InvalidToken, RuntimeError):
        return None


def hash_iin(iin: str) -> str:
    key = get_hash_key()
    return hmac.new(key, iin.encode("utf-8"), hashlib.sha256).hexdigest()


def mask_iin(iin: Optional[str]) -> Optional[str]:
    if not iin:
        return None
    digits = "".join(ch for ch in iin if ch.isdigit())
    if len(digits) < 4:
        return "****"
    return f"****{digits[-4:]}"


def serialize(doc):
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc


def parse_object_id(value):
    if not value:
        return None
    try:
        return ObjectId(value)
    except Exception:
        return None


def attach_masked_iin(user: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if not user:
        return None
    iin_masked = None
    if user.get("iin"):
        iin_masked = mask_iin(user.get("iin"))
    elif user.get("iin_encrypted"):
        iin_masked = mask_iin(decrypt_iin(user.get("iin_encrypted")))
    user["iin"] = iin_masked
    user.pop("iin_encrypted", None)
    user.pop("iin_hash", None)
    return user


LEVEL_THRESHOLDS = [
    ("novice", 0),
    ("intermediate", 100),
    ("expert", 250),
    ("master", 500),
    ("legend", 1000),
]


def compute_level(xp: int) -> Dict[str, Any]:
    xp = max(0, int(xp))
    current_level = "novice"
    next_threshold = None
    for idx, (name, threshold) in enumerate(LEVEL_THRESHOLDS):
        if xp >= threshold:
            current_level = name
            if idx + 1 < len(LEVEL_THRESHOLDS):
                next_threshold = LEVEL_THRESHOLDS[idx + 1][1]
            else:
                next_threshold = None
    if next_threshold is None:
        progress = 100
    else:
        prev_threshold = dict(LEVEL_THRESHOLDS)[current_level]
        progress = int(((xp - prev_threshold) / (next_threshold - prev_threshold)) * 100)
        progress = max(0, min(100, progress))
    return {"level": current_level, "professionalism": progress}


def add_xp(user_id: str, delta: int) -> Dict[str, Any]:
    object_id = parse_object_id(user_id)
    if not object_id:
        raise ValueError("invalid user id")
    delta = int(delta)
    if delta == 0:
        user = db.users.find_one({"_id": object_id})
        return {"xp": user.get("xp", 0), **compute_level(user.get("xp", 0))}
    db.users.update_one({"_id": object_id}, {"$inc": {"xp": delta}})
    user = db.users.find_one({"_id": object_id})
    xp = user.get("xp", 0)
    computed = compute_level(xp)
    db.users.update_one({"_id": object_id}, {"$set": computed})

    freelancer = db.freelancers.find_one({"user_id": user_id})
    if freelancer:
        db.freelancers.update_one(
            {"user_id": user_id},
            {"$set": {"professionalism": computed["professionalism"], "level": computed["level"], "updated_at": datetime.utcnow()}}
        )
    return {"xp": xp, **computed}


def ensure_test_admin():
    if os.getenv("SEED_TEST_ADMIN") != "1":
        return
    email = os.getenv("TEST_ADMIN_EMAIL", "test@admin.local")
    password = os.getenv("TEST_ADMIN_PASSWORD", "testtest")
    existing = db.users.find_one({"email": email})
    if existing:
        return
    user = {
        "email": email,
        "password": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "fullName": "Test Admin",
        "role": "admin",
        "xp": 0,
        "level": "novice",
        "professionalism": 0,
        "egov_auth": False,
        "created_at": datetime.utcnow()
    }
    db.users.insert_one(user)


ensure_test_admin()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.post("/api/auth/register")
def register():
    payload = request.get_json(force=True)
    email = payload.get("email")
    password = payload.get("password")
    full_name = payload.get("fullName")
    phone = payload.get("phone")
    iin = payload.get("iin")
    role = payload.get("role", "freelancer")

    if not email or not password:
        return jsonify({"error": "email and password required"}), 400
    if iin and (not iin.isdigit() or len(iin) != 12):
        return jsonify({"error": "iin must be 12 digits"}), 400

    if db.users.find_one({"email": email}):
        return jsonify({"error": "email already registered"}), 409

    iin_encrypted = encrypt_iin(iin) if iin else None
    iin_hash = hash_iin(iin) if iin else None

    user = {
        "email": email,
        "password": bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "fullName": full_name,
        "phone": phone,
        "role": role,
        "iin_encrypted": iin_encrypted,
        "iin_hash": iin_hash,
        "xp": 0,
        "level": "novice",
        "professionalism": 0,
        "egov_auth": False,
        "created_at": datetime.utcnow()
    }
    result = db.users.insert_one(user)
    user_id = str(result.inserted_id)

    if role in ["freelancer", "both"]:
        freelancer_profile = {
            "user_id": user_id,
            "title": "",
            "bio": "",
            "skills": [],
            "hourly_rate": None,
            "location": "",
            "languages": [],
            "education": [],
            "experience": [],
            "certifications": [],
            "completed_projects": 0,
            "rating": 0,
            "professionalism": 0,
            "level": "novice",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        db.freelancers.insert_one(freelancer_profile)
    return jsonify({"user_id": user_id, "role": role}), 201


@app.post("/api/auth/login")
def login():
    payload = request.get_json(force=True)
    email = payload.get("email")
    password = payload.get("password")

    user = db.users.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"error": "invalid credentials"}), 401

    try:
        add_xp(str(user["_id"]), 1)
    except Exception:
        pass

    return jsonify({"user_id": str(user["_id"]), "role": user["role"]})


@app.post("/api/gamification/xp")
def add_xp_endpoint():
    payload = request.get_json(force=True) or {}
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    try:
        amount = int(payload.get("amount", 1))
    except Exception:
        return jsonify({"error": "amount must be a number"}), 400
    if amount <= 0 or amount > 100:
        return jsonify({"error": "amount must be between 1 and 100"}), 400
    try:
        updated = add_xp(user_id, amount)
        return jsonify(updated)
    except ValueError:
        return jsonify({"error": "invalid user id"}), 400


# eGov OAuth Configuration
EGOV_CLIENT_ID = os.getenv("EGOV_CLIENT_ID", "freelancekz-app")
EGOV_CLIENT_SECRET = os.getenv("EGOV_CLIENT_SECRET", "")
EGOV_REDIRECT_URI = os.getenv("EGOV_REDIRECT_URI", "http://localhost:8080/auth/egov/callback")
EGOV_BASE_URL = "https://idp.egov.kz"


@app.route("/api/auth/egov/authorize")
def egov_authorize():
    """Redirect user to eGov.kz login page"""
    state = request.args.get("state", "")
    params = {
        "client_id": EGOV_CLIENT_ID,
        "redirect_uri": EGOV_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile phone",
        "state": state,
    }
    auth_url = f"{EGOV_BASE_URL}/oauth2/authorize?{requests.compat.urlencode(params)}"
    return redirect(auth_url)


@app.route("/api/auth/egov/callback")
def egov_callback():
    """Handle eGov OAuth callback"""
    code = request.args.get("code")
    error = request.args.get("error")
    state = request.args.get("state", "")

    if error:
        return jsonify({"error": f"eGov error: {error}"}), 400

    if not code:
        return jsonify({"error": "No authorization code received"}), 400

    # Exchange code for tokens
    try:
        token_data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": EGOV_CLIENT_ID,
            "redirect_uri": EGOV_REDIRECT_URI,
        }

        if EGOV_CLIENT_SECRET:
            token_data["client_secret"] = EGOV_CLIENT_SECRET

        token_response = requests.post(
            f"{EGOV_BASE_URL}/oauth2/token",
            data=token_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )

        if not token_response.ok:
            return jsonify({"error": f"Token exchange failed: {token_response.text}"}), 400

        tokens = token_response.json()
        access_token = tokens.get("access_token")

        # Get user info
        user_response = requests.get(
            f"{EGOV_BASE_URL}/oauth2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        if not user_response.ok:
            return jsonify({"error": "Failed to get user info"}), 400

        user_info = user_response.json()

        # Return user info to frontend
        return jsonify({
            "success": True,
            "user": {
                "id": user_info.get("sub"),
                "email": user_info.get("email"),
                "phone": user_info.get("phone_number"),
                "iin": user_info.get("iin"),
                "fullName": user_info.get("name"),
            },
            "access_token": access_token,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.get("/api/auth/egov/session")
def egov_session():
    """
    Check if user has an existing eGov session.
    Note: eGov sessions are maintained via cookies on the eGov domain,
    which we cannot directly access. This endpoint can be extended to
    check local session storage or implement refresh token logic.
    """
    # For now, just return that we need to check via redirect
    # The actual session check happens when user is redirected to eGov
    return jsonify({
        "authenticated": False,
        "message": "eGov session must be verified via OAuth redirect"
    })


@app.post("/api/auth/egov/register")
def egov_register():
    """Register/login user via eGov data"""
    payload = request.get_json(force=True)
    email = payload.get("email")
    iin = payload.get("iin")
    phone = payload.get("phone")
    fullName = payload.get("fullName")
    role = payload.get("role", "freelancer")

    if not email and not iin and not phone:
        return jsonify({"error": "email, iin, or phone is required"}), 400

    # Find or create user by any available identifier
    query = {}
    if email:
        query["email"] = email
    elif iin:
        query["iin_hash"] = hash_iin(iin)
    elif phone:
        query["phone"] = phone

    existing_user = db.users.find_one(query)

    if existing_user:
        # Update user info
        update_fields = {
            "egov_auth": True,
            "updated_at": datetime.utcnow()
        }
        if phone:
            update_fields["phone"] = phone
        if fullName:
            update_fields["fullName"] = fullName
        if iin:
            update_fields["iin_encrypted"] = encrypt_iin(iin)
            update_fields["iin_hash"] = hash_iin(iin)
        if email:
            update_fields["email"] = email
        if "xp" not in existing_user:
            update_fields["xp"] = 0
            update_fields["level"] = "novice"
            update_fields["professionalism"] = 0
        
        # Also update freelancer profile if exists
        user_id = str(existing_user["_id"])
        freelancer = db.freelancers.find_one({"user_id": user_id})
        if freelancer:
            update_freelancer = {"updated_at": datetime.utcnow()}
            if phone:
                update_freelancer["phone"] = phone
            db.freelancers.update_one({"user_id": user_id}, {"$set": update_freelancer})
        
        db.users.update_one(
            {"_id": existing_user["_id"]},
            {"$set": update_fields}
        )

        return jsonify({
            "user_id": user_id,
            "role": existing_user.get("role", "freelancer"),
            "existing": True
        })

    # Create new user - use phone as email substitute if email not provided
    # Generate a random password since user will login via eGov
    random_password = bcrypt.hashpw(os.urandom(32), bcrypt.gensalt()).decode('utf-8')
    
    # If no email, use phone@egov.local as placeholder
    user_email = email if email else (f"{phone}@egov.local" if phone else None)
    iin_encrypted = encrypt_iin(iin) if iin else None
    iin_hash = hash_iin(iin) if iin else None

    user = {
        "email": user_email,
        "iin_encrypted": iin_encrypted,
        "iin_hash": iin_hash,
        "phone": phone,
        "fullName": fullName,
        "password": random_password,
        "role": role,
        "xp": 0,
        "level": "novice",
        "professionalism": 0,
        "egov_auth": True,
        "created_at": datetime.utcnow()
    }

    result = db.users.insert_one(user)
    user_id = str(result.inserted_id)
    
    # Create freelancer profile for the user
    if role in ["freelancer", "both"]:
        freelancer_profile = {
            "user_id": user_id,
            "title": "",
            "bio": "",
            "skills": [],
            "hourly_rate": None,
            "location": "",
            "languages": [],
            "education": [],
            "experience": [],
            "certifications": [],
            "completed_projects": 0,
            "rating": 0,
            "professionalism": 0,
            "level": "novice",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        db.freelancers.insert_one(freelancer_profile)
    
    return jsonify({"user_id": user_id, "role": role, "existing": False}), 201


@app.post("/api/auth/egov/verify")
def egov_verify():
    """Verify an existing user via eGov and update profile fields."""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401

    object_id = parse_object_id(user_id)
    if not object_id:
        return jsonify({"error": "invalid user id"}), 400

    payload = request.get_json(force=True)
    email = payload.get("email")
    iin = payload.get("iin")
    phone = payload.get("phone")
    fullName = payload.get("fullName")

    update_fields = {
        "egov_auth": True,
        "updated_at": datetime.utcnow()
    }
    if phone:
        update_fields["phone"] = phone
    if fullName:
        update_fields["fullName"] = fullName
    if iin:
        update_fields["iin_encrypted"] = encrypt_iin(iin)
        update_fields["iin_hash"] = hash_iin(iin)
    if email:
        update_fields["email"] = email

    existing_user = db.users.find_one({"_id": object_id})
    if existing_user and "xp" not in existing_user:
        update_fields["xp"] = 0
        update_fields["level"] = "novice"
        update_fields["professionalism"] = 0

    db.users.update_one({"_id": object_id}, {"$set": update_fields})

    # Also update freelancer profile if exists
    freelancer = db.freelancers.find_one({"user_id": user_id})
    if freelancer:
        freelancer_update = {"updated_at": datetime.utcnow()}
        if phone:
            freelancer_update["phone"] = phone
        db.freelancers.update_one({"user_id": user_id}, {"$set": freelancer_update})

    user = db.users.find_one({"_id": object_id})
    return jsonify({
        "user_id": user_id,
        "role": user.get("role", "freelancer"),
        "egov_auth": True
    })


@app.get("/api/users/me")
def get_current_user():
    """Get current user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    object_id = parse_object_id(user_id)
    if not object_id:
        return jsonify({"error": "invalid user id"}), 400
    
    user = db.users.find_one({"_id": object_id})
    if not user:
        return jsonify({"error": "user not found"}), 404

    if "xp" not in user:
        db.users.update_one(
            {"_id": object_id},
            {"$set": {"xp": 0, "level": "novice", "professionalism": 0}}
        )
        user["xp"] = 0
        user["level"] = "novice"
        user["professionalism"] = 0

    # Get freelancer profile if applicable
    freelancer = None
    if user.get("role") in ["freelancer", "both"]:
        freelancer = db.freelancers.find_one({"user_id": user_id})
    
    return jsonify({
        "user": attach_masked_iin(serialize(user)),
        "freelancer": serialize(freelancer)
    })


@app.put("/api/users/me")
def update_current_user():
    """Update current user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    object_id = parse_object_id(user_id)
    if not object_id:
        return jsonify({"error": "invalid user id"}), 400
    
    payload = request.get_json(force=True)
    
    # Fields that can be updated
    allowed_fields = ["fullName", "phone", "title", "bio", "location", "hourly_rate", "languages"]
    update_data = {k: v for k, v in payload.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user
    db.users.update_one({"_id": object_id}, {"$set": update_data})
    
    # Update freelancer profile if exists
    freelancer = db.freelancers.find_one({"user_id": user_id})
    if freelancer:
        freelancer_update = {k: v for k, v in payload.items() if k in ["title", "bio", "location", "hourly_rate", "languages"]}
        freelancer_update["updated_at"] = datetime.utcnow()
        db.freelancers.update_one({"user_id": user_id}, {"$set": freelancer_update})
    
    user = db.users.find_one({"_id": object_id})
    return jsonify({"user": serialize(user)})


@app.get("/api/profile/<user_id>")
def get_profile(user_id):
    """Get user profile with education and experience"""
    object_id = parse_object_id(user_id)
    if not object_id:
        return jsonify({"error": "invalid user id"}), 400
    
    user = db.users.find_one({"_id": object_id})
    if not user:
        return jsonify({"error": "user not found"}), 404

    if "xp" not in user:
        db.users.update_one(
            {"_id": object_id},
            {"$set": {"xp": 0, "level": "novice", "professionalism": 0}}
        )
        user["xp"] = 0
        user["level"] = "novice"
        user["professionalism"] = 0
    
    freelancer = db.freelancers.find_one({"user_id": user_id})
    
    return jsonify({
        "user": attach_masked_iin(serialize(user)),
        "freelancer": serialize(freelancer)
    })


@app.post("/api/profile/education")
def add_education():
    """Add education to user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    payload = request.get_json(force=True)
    education = {
        "institution": payload.get("institution"),
        "degree": payload.get("degree"),
        "field": payload.get("field"),
        "start_date": payload.get("start_date"),
        "end_date": payload.get("end_date"),
        "description": payload.get("description"),
        "created_at": datetime.utcnow()
    }
    
    result = db.education.insert_one({
        "user_id": user_id,
        **education
    })
    
    # Also update freelancer profile
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$push": {"education": education},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"education_id": str(result.inserted_id), **education}), 201


@app.delete("/api/profile/education/<education_id>")
def delete_education(education_id):
    """Delete education from user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    object_id = parse_object_id(education_id)
    if not object_id:
        return jsonify({"error": "invalid education id"}), 400
    
    education = db.education.find_one({"_id": object_id, "user_id": user_id})
    if not education:
        return jsonify({"error": "education not found"}), 404
    
    db.education.delete_one({"_id": object_id})
    
    # Remove from freelancer profile
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$pull": {"education": {"institution": education.get("institution")}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"success": True})


@app.post("/api/profile/experience")
def add_experience():
    """Add work experience to user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    payload = request.get_json(force=True)
    experience = {
        "company": payload.get("company"),
        "position": payload.get("position"),
        "start_date": payload.get("start_date"),
        "end_date": payload.get("end_date"),
        "description": payload.get("description"),
        "skills_used": payload.get("skills_used", []),
        "created_at": datetime.utcnow()
    }
    
    result = db.experience.insert_one({
        "user_id": user_id,
        **experience
    })
    
    # Also update freelancer profile
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$push": {"experience": experience},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"experience_id": str(result.inserted_id), **experience}), 201


@app.delete("/api/profile/experience/<experience_id>")
def delete_experience(experience_id):
    """Delete work experience from user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    object_id = parse_object_id(experience_id)
    if not object_id:
        return jsonify({"error": "invalid experience id"}), 400
    
    exp = db.experience.find_one({"_id": object_id, "user_id": user_id})
    if not exp:
        return jsonify({"error": "experience not found"}), 404
    
    db.experience.delete_one({"_id": object_id})
    
    # Remove from freelancer profile
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$pull": {"experience": {"company": exp.get("company")}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"success": True})


@app.post("/api/profile/skills")
def add_skill():
    """Add skill to user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    payload = request.get_json(force=True)
    skill = payload.get("skill")
    
    if not skill:
        return jsonify({"error": "skill is required"}), 400
    
    # Add to skills array if not exists
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$addToSet": {"skills": skill},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"success": True, "skill": skill})


@app.delete("/api/profile/skills")
def remove_skill():
    """Remove skill from user profile"""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        return jsonify({"error": "user not authenticated"}), 401
    
    payload = request.get_json(force=True)
    skill = payload.get("skill")
    
    if not skill:
        return jsonify({"error": "skill is required"}), 400
    
    db.freelancers.update_one(
        {"user_id": user_id},
        {
            "$pull": {"skills": skill},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return jsonify({"success": True})


@app.get("/api/freelancers")
def list_freelancers():
    freelancers = [serialize(doc) for doc in db.freelancers.find()]
    return jsonify(freelancers)


@app.get("/api/freelancers/<freelancer_id>")
def get_freelancer(freelancer_id):
    object_id = parse_object_id(freelancer_id)
    if not object_id:
        return jsonify({"error": "invalid freelancer id"}), 400
    doc = db.freelancers.find_one({"_id": object_id})
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(serialize(doc))


@app.post("/api/freelancers")
def create_freelancer():
    payload = request.get_json(force=True)
    payload["created_at"] = datetime.utcnow()
    result = db.freelancers.insert_one(payload)
    return jsonify({"freelancer_id": str(result.inserted_id)}), 201


@app.get("/api/clients")
def list_clients():
    clients = [serialize(doc) for doc in db.clients.find()]
    return jsonify(clients)


@app.post("/api/clients")
def create_client():
    payload = request.get_json(force=True)
    payload["created_at"] = datetime.utcnow()
    result = db.clients.insert_one(payload)
    return jsonify({"client_id": str(result.inserted_id)}), 201


@app.get("/api/reviews")
def list_reviews():
    freelancer_id = request.args.get("freelancer_id")
    query = {"freelancer_id": freelancer_id} if freelancer_id else {}
    reviews = [serialize(doc) for doc in db.reviews.find(query)]
    return jsonify(reviews)


@app.post("/api/reviews")
def create_review():
    payload = request.get_json(force=True)
    payload["created_at"] = datetime.utcnow()
    result = db.reviews.insert_one(payload)
    return jsonify({"review_id": str(result.inserted_id)}), 201


@app.get("/api/projects")
def list_projects():
    freelancer_id = request.args.get("freelancer_id")
    query = {"freelancer_id": freelancer_id} if freelancer_id else {}
    projects = [serialize(doc) for doc in db.projects.find(query)]
    return jsonify(projects)


@app.post("/api/projects")
def create_project():
    payload = request.get_json(force=True)
    payload["created_at"] = datetime.utcnow()
    result = db.projects.insert_one(payload)
    return jsonify({"project_id": str(result.inserted_id)}), 201


@app.get("/api/jobs")
def list_jobs():
    search = request.args.get("q")
    category = request.args.get("category")
    query = {}

    if category and category != "all":
        query["category"] = category

    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"skills": {"$elemMatch": {"$regex": search, "$options": "i"}}},
        ]

    jobs = [serialize(doc) for doc in db.jobs.find(query).sort("created_at", -1)]
    return jsonify(jobs)


@app.get("/api/jobs/<job_id>")
def get_job(job_id):
    object_id = parse_object_id(job_id)
    if not object_id:
        return jsonify({"error": "invalid job id"}), 400
    doc = db.jobs.find_one({"_id": object_id})
    if not doc:
        return jsonify({"error": "not found"}), 404
    return jsonify(serialize(doc))


@app.post("/api/jobs")
def create_job():
    payload = request.get_json(force=True)
    title = payload.get("title")
    description = payload.get("description")

    if not title or not description:
        return jsonify({"error": "title and description required"}), 400

    payload["created_at"] = datetime.utcnow()
    result = db.jobs.insert_one(payload)
    return jsonify({"job_id": str(result.inserted_id)}), 201


@app.get("/api/profiles/<freelancer_id>")
def get_freelancer_profile(freelancer_id):
    object_id = parse_object_id(freelancer_id)
    if not object_id:
        return jsonify({"error": "invalid freelancer id"}), 400

    freelancer = db.freelancers.find_one({"_id": object_id})
    if not freelancer:
        return jsonify({"error": "not found"}), 404

    projects = [serialize(doc) for doc in db.projects.find({"freelancer_id": freelancer_id})]
    reviews = [serialize(doc) for doc in db.reviews.find({"freelancer_id": freelancer_id})]

    return jsonify({
        "freelancer": serialize(freelancer),
        "projects": projects,
        "reviews": reviews,
    })


@app.get("/api/messages")
def list_messages():
    user_id = request.args.get("user_id")
    query = {"participants": user_id} if user_id else {}
    messages = [serialize(doc) for doc in db.messages.find(query)]
    return jsonify(messages)


@app.post("/api/messages")
def create_message():
    payload = request.get_json(force=True)
    payload["created_at"] = datetime.utcnow()
    result = db.messages.insert_one(payload)
    return jsonify({"message_id": str(result.inserted_id)}), 201


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    app.run(debug=debug, port=8000, use_reloader=debug)
