from fastapi import APIRouter, Depends, HTTPException, status, Response
from schemas.users import UserRegisterData, UserData
from sqlalchemy.orm import Session
from database import get_session
from tools.security import sec
from models import User
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

router = APIRouter(prefix='/api',tags=['users'])

@router.post('/auth/register')
async def create_user(user_data: UserRegisterData, response: Response, session: Session = Depends(get_session)):
    salt = sec.generate_salt()
    hash_password = sec.get_password_hash(salt, user_data.password)
    user = User(name = user_data.name, email=user_data.email
                , salt = salt, hash_password = hash_password)
    try:
        session.add(user)
        session.commit()
        session.refresh(user)
        
    except IntegrityError:
        session.rollback()
        response.status_code = status.HTTP_409_CONFLICT
        return HTTPException(status.HTTP_409_CONFLICT, 'User with this email already exists')
    except:
        session.rollback()
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        return HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, 'Internal server error')
    
    return {"user_id": user.id, "username": user.name, "email": user.email}


@router.post('/auth/login')
async def login(user_data: UserData, response: Response, session: Session = Depends(get_session)):
    query = select(User).where(User.email == user_data.email)
    user = session.scalar(query)
    if not user:
        response.status_code = 404
        return HTTPException(status.HTTP_404_NOT_FOUND, 'Email or password is not correct')
    else:
        if sec.get_password_hash(user.salt,user_data.password) == user.hash_password:
            response.set_cookie("token",sec.genereate_jwt_token(user.id))
            return {"user_id": user.id, "username": user.name, "email": user.email}
        else:
            response.status_code = 404
            return HTTPException(status.HTTP_404_NOT_FOUND, 'Email or password is not correct')
        




    

