import os
import json
from flask import Flask, request
from flask_cors import CORS
import csv
import flask_sqlalchemy
import flask_praetorian
import flask_cors
import numpy as np
import pandas as pd


db = flask_sqlalchemy.SQLAlchemy()
guard = flask_praetorian.Praetorian()
cors = flask_cors.CORS()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, unique=True)
    password = db.Column(db.Text)
    roles = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True, server_default='true')

    @property
    def rolenames(self):
        try:
            return self.roles.split(',')
        except Exception:
            return []

    @classmethod
    def lookup(cls, username):
        return cls.query.filter_by(username=username).one_or_none()

    @classmethod
    def identify(cls, id):
        return cls.query.get(id)

    @property
    def identity(self):
        return self.id

    def is_valid(self):
        return self.is_active


app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'top secret'
app.config['JWT_ACCESS_LIFESPAN'] = {'hours': 24}
app.config['JWT_REFRESH_LIFESPAN'] = {'days': 30}
CORS(app)


# Initialize the flask-praetorian instance for the app
guard.init_app(app, User)

# Initialize a local database for the example
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.getcwd(), 'database.db')}"
db.init_app(app)


# Add users for the example
with app.app_context():
    db.create_all()
    if db.session.query(User).filter_by(username='Yasoob').count() < 1:
        db.session.add(User(
          username='N-vibe',
          password=guard.hash_password('n-vibe'),
          roles='admin'
            ))
    db.session.commit()

# NOTE: This route is needed for the default EB health check route
@app.route('/')
def home():
    return "ok"

def readcsv(filename):
    data = pd.read_csv(filename) #Please add four spaces here before this line
    res = np.array(data)
    return(np.array_str(res))



@app.route('/api/data')
def getCSVData():
    #return readcsv("velib-pos.csv")
    with open('velib-pos.csv','rb') as csvfile: 
        reader = csv.reader(csvfile, delimiter=';', quotechar='|') 
        for row in reader:
            print(row)



@app.route('/api/login', methods=['POST'])
def login():
    """
    Logs a user in by parsing a POST request containing user credentials and
    issuing a JWT token.
    .. example::
       $ curl http://localhost:5000/api/login -X POST \
         -d '{"username":"Yasoob","password":"strongpassword"}'
    """
    req = flask.request.get_json(force=True)
    username = req.get('username', None)
    password = req.get('password', None)
    user = guard.authenticate(username, password)
    ret = {'access_token': guard.encode_jwt_token(user)}
    return ret, 200

  
@app.route('/api/refresh', methods=['POST'])
def refresh():
    """
    Refreshes an existing JWT by creating a new one that is a copy of the old
    except that it has a refrehsed access expiration.
    .. example::
       $ curl http://localhost:5000/api/refresh -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    print("refresh request")
    old_token = request.get_data()
    new_token = guard.refresh_jwt_token(old_token)
    ret = {'access_token': new_token}
    return ret, 200
  
  
@app.route('/api/protected')
@flask_praetorian.auth_required
def protected():
    """
    A protected endpoint. The auth_required decorator will require a header
    containing a valid JWT
    .. example::
       $ curl http://localhost:5000/api/protected -X GET \
         -H "Authorization: Bearer <your_token>"
    """
    return {'message': f'protected endpoint (allowed user {flask_praetorian.current_user().username})'}




@app.route('/api/get_topics')
def get_topics():
    return {"topics": ["topic1", "other stuff", "next topic"]}
@app.route('/api/submit_question', methods=["POST"])
def submit_question():
    question = json.loads(request.data)["question"]
    return {"answer": f"You Q was {len(question)} chars long"}
if __name__ == '__main__':
    app.run(port=8080)