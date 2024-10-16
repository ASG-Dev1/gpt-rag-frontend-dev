echo "start build script"

cd ./frontend

npm i

npm run build

cd ..

echo "Starting local run"

./startwin.sh