from fastapi import APIRouter, Body, Response, Depends, Cookie, status, HTTPException, Path
from database import get_session
from tools.security import sec
from sqlalchemy import select
from sqlalchemy.orm import Session
from models import Monitor, Journal
from tools.monitors import checker  
from pydantic import AnyHttpUrl
import asyncio

router = APIRouter(prefix="/api/monitor", tags=["Monitors (URLs)"])

@router.post("/")
async def create_monitor(response: Response, url: AnyHttpUrl = Body(),
                         monitor_name = Body(default=None), id = Depends(sec.decode_jwt), session: Session = Depends(get_session)
                         ):
    query = select(Monitor).where(Monitor.user_id == id, Monitor.url == url.unicode_string())
    monitor = session.scalar(query)
    if monitor:
        response.status_code = status.HTTP_409_CONFLICT
        return HTTPException(response.status_code, 'Srvice already exists')
    else:
        monitor = Monitor(name = monitor_name, url = url.unicode_string(), user_id = id)
        session.add(monitor)
        session.commit()
        session.refresh(monitor)
        return monitor

@router.get("/")
async def get_monitors(id = Depends(sec.decode_jwt), session: Session = Depends(get_session)):
    query = select(Monitor).where(Monitor.user_id == id)
    return session.scalars(query).all()



@router.get('/all/check')
async def check_all_monitors(user_id = Depends(sec.decode_jwt), session: Session = Depends(get_session)):
    query = select(Monitor).where(Monitor.user_id == user_id)
    monitors = session.scalars(query).all()
    results = await asyncio.gather(*checker.task_gererator(monitors))
    return results
    


@router.get('/{id}/check')
async def check_monitor(id = Path(), user_id = Depends(sec.decode_jwt), session: Session = Depends(get_session)):
    monitor = session.get(Monitor,id)
    if not monitor or monitor.user_id != user_id:
        return Response(HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Service is not found'),status_code=status.HTTP_404_NOT_FOUND)
    result = await checker.check_url(monitor.url)
    log = Journal(user_id = user_id, monitor_id=id, response_time = result["response_time"],
                  response_status = result["status"])
    session.add(log)
    session.commit()
    session.refresh(log)
    return log





    
  