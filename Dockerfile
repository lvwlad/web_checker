FROM python
WORKDIR /app
COPY . .
RUN pip install -r dependenсies.txt 
WORKDIR /app/src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
