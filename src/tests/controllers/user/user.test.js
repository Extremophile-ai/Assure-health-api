import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../../../server';
import {
  user,
  user2,
  user3,
  user4,
  user5,
  updateDetails
} from './user.test.data';
import sendGrid from '../../../Utility/sendgrid';

sendGrid.sandboxMode();
chai.should();
chai.use(chaiHttp);

describe('Should handle correct user behaviour', async () => {
  describe('/ should render the homepage', () => {
    it('it should render the homepage', (done) => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });

  describe('/user/signup should create a user', () => {
    it('it should create a user with complete details successfully', (done) => {
      chai
        .request(server)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').eql('User created successfully, Please check your mail box to verify your email address');
          done();
        });
    });
    it('it should not create a user with an already registered email', (done) => {
      chai
        .request(server)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(user2)
        .end((err, res) => {
          res.should.have.status(409);
          done();
        });
    });
    it('it should not create a user with unmatched passwords', (done) => {
      chai
        .request(server)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(user3)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });
  });
  describe("/user/verify_mail/:email should verify a user's email", () => {
    it("it should verify a user's account", (done) => {
      chai
        .request(server)
        .get(`/user/verify_mail/${user.email}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
  describe('/user/login should sign in a user', () => {
    it('it should sign in a user with complete details successfully', (done) => {
      chai
        .request(server)
        .post('/user/login')
        .set('Accept', 'application/json')
        .send(user4)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Logged in successfully');
          done();
        });
    });
    it('it should not sign in a user with unregistered details', (done) => {
      chai
        .request(server)
        .post('/user/login')
        .set('Accept', 'application/json')
        .send(user5)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Provided email address does not exist');
          done();
        });
    });
  });
  describe('/users should get all users', () => {
    it('it should get all registered users', (done) => {
      chai
        .request(server)
        .get('/users')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('All Users retrieved');
          done();
        });
    });
  });
  describe('Should handle single user actions', () => {
    let userToken;
    before((done) => {
      chai
        .request(server)
        .post('/user/login')
        .set('Accept', 'application/json')
        .send(user4)
        .end((err, res) => {
          if (err) throw err;
          userToken = res.body.token;
          done();
        });
    });
    it('user should update their details', (done) => {
      chai
        .request(server)
        .patch('/user/update')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Accept', 'application/json')
        .send(updateDetails)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('User details updated successfully');
          done();
        });
    });
    it('Only signed in user should update details', (done) => {
      chai
        .request(server)
        .patch('/user/update')
        .send(updateDetails)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error').eql('Sorry, you have to login.');
          done();
        });
    });
    it("it should delete a logged in user's account", (done) => {
      chai
        .request(server)
        .delete('/user/delete')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Accept', 'application/json')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.have.property('message').eql('Account deleted successfully');
          done();
        });
    });
    it('Only logged in user can delete account', (done) => {
      chai
        .request(server)
        .delete('/user/delete')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.have.property('error').eql('Sorry, you have to login.');
          done();
        });
    });
  });
});
