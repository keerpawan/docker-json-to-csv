# convert
Don't like installing Nodejs?

You can convert your Json to CSV with Nodejs using Docker.

## Setup

Make sure you have docker desktop running

### 1. Build image
```
docker build -t convert:latest --target build --file ./Dockerfile .
```

### 2. Put the performance JSON contents to be converted in data/input.json

## Run

### 1. Put the json file under the data dir
```
data/input.json
```

### 2. Run container

```
docker-compose up convert
```

### 3. Look at generated csv file 

```
cat data/output.csv
```

