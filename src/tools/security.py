import hashlib
import secrets
import jwt
from  datetime import timedelta, timezone, datetime
from fastapi import HTTPException, Cookie, Response




class Security:


    def __init__(self):
        self._SECRET_KEY = "my-very-secret-key" # it better be in .env
        self._ALGORITHM = "HS256"

    def generate_salt(self) -> str:
        return secrets.token_bytes(16)

    def get_password_hash(self, salt: str, password: str):
        hash_obj = hashlib.pbkdf2_hmac('sha256', password.encode("utf-8"), salt, 1000)
        return hash_obj.hex()

    def genereate_jwt_token(self,id: int):
        payload = {
            "user_id": id,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
             }
        token = jwt.encode(payload, self._SECRET_KEY,self._ALGORITHM)
        return token

    def decode_jwt(self, token = Cookie(default=None)):
        if not token:
            return Response(HTTPException(status_code=401,detail="No auth"),401)
        try:
            payload = jwt.decode(token,self._SECRET_KEY, self._ALGORITHM)
        except:
            return Response(HTTPException(status_code=401,detail="No auth"),401)
        return payload["user_id"]
            



    

        




sec = Security()





