FROM python
WORKDIR .
COPY .env, src/*
RUN pip install -r dependencies.txt
CMD ["uvicorn", "src/main:app"]
