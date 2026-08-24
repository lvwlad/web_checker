from sqlalchemy.orm import DeclarativeBase, Mapped, relationship, mapped_column
from sqlalchemy import String, Integer, Column, ForeignKey, LargeBinary, TIMESTAMP, func, Float

class Base(DeclarativeBase): 
    pass

class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True)
    salt: Mapped[str] = mapped_column(LargeBinary)
    hash_password: Mapped[str] = mapped_column(String)
    monitors: Mapped[list[Monitor]] = relationship()
    logs: Mapped[list[Journal]] = relationship()

class Monitor(Base):
    __tablename__ = 'monitors'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=True)
    url: Mapped[str] = mapped_column(String, nullable = False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    logs: Mapped[list[Journal]] = relationship()

class Journal(Base):
    __tablename__ = "journal"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    check_date = Column(TIMESTAMP, default=func.now())
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('users.id'))
    monitor_id: Mapped[int] = mapped_column(Integer, ForeignKey('monitors.id'))
    response_time: Mapped[float] = mapped_column(Float)
    response_status: Mapped[int] = mapped_column(Integer)





    




