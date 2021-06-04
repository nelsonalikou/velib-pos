echo "Deploying Backend..."
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin 712006740189.dkr.ecr.eu-west-3.amazonaws.com
docker build -t velib-pos-backend .
docker tag velib-pos-backend:latest 712006740189.dkr.ecr.eu-west-3.amazonaws.com/velib-pos-backend:latest
docker push 712006740189.dkr.ecr.eu-west-3.amazonaws.com/velib-pos-backend:latest

cd backend/aws_deploy
eb deploy