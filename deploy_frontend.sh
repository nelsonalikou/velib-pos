echo "Deploying Frontend..."
cd frontend
export REACT_APP_API_URL=/api
npm run build
aws s3 sync build/ s3://velib-pos-frontend --endpoint-url https://s3.eu-west-3.amazonaws.com