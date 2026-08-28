FROM python
WORKDIR /app
COPY . .
RUN pip install -r dependencies.txt
CMD ["uvicorn", "src/main:app"]
