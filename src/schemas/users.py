from pydantic import BaseModel, Field, EmailStr, ConfigDict

class UserRegisterData(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr  
    password: str = Field(min_length=8)



class UserData(BaseModel):
    email: EmailStr  
    password: str = Field(min_length=8)




