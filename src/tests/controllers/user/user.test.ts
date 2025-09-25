import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { Application } from 'express';
import app from '@/server';
import {
  validUser,
  duplicateEmailUser,
  unmatchedPasswordUser,
  validLoginUser,
  invalidLoginUser,
  updateUserDetails,
  healthPlanData,
  invalidUserData
} from './user.test.data';
import EmailService from '@/utils/sendgrid';
import { sequelize, testConnection, User } from '@/models';

// Configure chai
chai.use(chaiHttp);
chai.should();

// Type cast chai for http requests
const chaiRequest = (chai as any);

// Enable sandbox mode for email testing
// EmailService.enableSandboxMode();

describe('🧪 Assure Health API - User Management Tests', () => {
  let userToken: string;
  let testApp: Application;

  // Setup before all tests
  before(async function() {
    this.timeout(10000); // Increase timeout for database operations
    
    testApp = app;
    
    // Test database connection
    try {
      await testConnection();
      console.log('✅ Test database connected');
      
      // Clean up test data
      await User.destroy({ where: { email: validUser.email } });
      await User.destroy({ where: { email: 'admin@assurehealth.com' } });
      
    } catch (error) {
      console.error('❌ Test database setup failed:', error);
      throw error;
    }
  });

  // Cleanup after all tests
  after(async function() {
    this.timeout(5000);
    
    try {
      // Clean up test data
      await User.destroy({ where: { email: validUser.email } });
      await User.destroy({ where: { email: 'admin@assurehealth.com' } });
      
      // Close database connection
      await sequelize.close();
      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.error('❌ Test cleanup failed:', error);
    }
  });

  describe('🏠 Root Endpoints', () => {
    it('should render the API welcome message', (done) => {
      chaiRequest
        .request(testApp)
        .get('/')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').include('Welcome to Assure Health API');
          done();
        });
    });

    it('should return API health status', (done) => {
      chaiRequest
        .request(testApp)
        .get('/health')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').include('API is running');
          done();
        });
    });

    it('should return API documentation info', (done) => {
      chaiRequest
        .request(testApp)
        .get('/api')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('endpoints');
          done();
        });
    });
  });

  describe('👤 User Registration (POST /user/signup)', () => {
    it('should successfully create a user with valid details', function(done) {
      this.timeout(5000);
      
      chaiRequest
        .request(testApp)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(validUser)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').include('Account created successfully');
          res.body.should.have.property('token');
          res.body.should.have.property('data');
          res.body.data.should.have.property('user');
          
          // Store user data for later tests
          expect(res.body.data.user.email).to.equal(validUser.email.toLowerCase());
          expect(res.body.data.user.firstName).to.equal(validUser.firstName.toLowerCase());
          
          done();
        });
    });

    it('should reject duplicate email registration', (done) => {
      chaiRequest
        .request(testApp)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(duplicateEmailUser)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(409);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error').include('email already exists');
          done();
        });
    });

    it('should reject mismatched passwords', (done) => {
      chaiRequest
        .request(testApp)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(unmatchedPasswordUser)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error').include('Passwords do not match');
          done();
        });
    });

    it('should reject invalid email format', (done) => {
      chaiRequest
        .request(testApp)
        .post('/user/signup')
        .set('Accept', 'application/json')
        .send(invalidUserData.invalidEmail)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error').include('valid email');
          done();
        });
    });
  });

  describe('📧 Email Verification (GET /user/verify_mail/:email)', () => {
    it('should verify user email successfully', (done) => {
      chaiRequest
        .request(testApp)
        .get(`/user/verify_mail/${validUser.email}`)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').include('verification successful');
          done();
        });
    });

    it('should reject invalid email format in verification', (done) => {
      chaiRequest
        .request(testApp)
        .get('/user/verify_mail/invalid-email-format')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          done();
        });
    });
  });

  describe('🔐 User Login (POST /user/login)', () => {
    it('should login successfully with valid credentials', (done) => {
      chaiRequest
        .request(testApp)
        .post('/user/login')
        .set('Accept', 'application/json')
        .send(validLoginUser)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(true);
          res.body.should.have.property('message').include('Login successful');
          res.body.should.have.property('token');
          
          // Store token for authenticated tests
          userToken = res.body.token;
          expect(userToken).to.be.a('string');
          
          done();
        });
    });

    it('should reject login with invalid credentials', (done) => {
      chaiRequest
        .request(testApp)
        .post('/user/login')
        .set('Accept', 'application/json')
        .send(invalidLoginUser)
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error').include('Invalid email or password');
          done();
        });
    });
  });

  describe('👥 Get All Users (GET /users)', () => {
    it('should require authentication for admin endpoints', (done) => {
      chaiRequest
        .request(testApp)
        .get('/users')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(401);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          done();
        });
    });

    // Note: This test would require creating an admin user or mocking admin role
    it.skip('should retrieve all users for admin users', (done) => {
      // Implementation would require admin authentication
      done();
    });
  });

  describe('🔒 Authenticated User Operations', () => {
    describe('✏️ Update User Details (PATCH /user/update)', () => {
      it('should update user details when authenticated', (done) => {
        chaiRequest
          .request(testApp)
          .patch('/user/update')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Accept', 'application/json')
          .send(updateUserDetails)
          .end((err: any, res: any) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('message').include('updated successfully');
            done();
          });
      });

      it('should reject update without authentication', (done) => {
        chaiRequest
          .request(testApp)
          .patch('/user/update')
          .set('Accept', 'application/json')
          .send(updateUserDetails)
          .end((err: any, res: any) => {
            expect(err).to.be.null;
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            done();
          });
      });
    });

    describe('🏥 Health Plan Management (PATCH /user/update/health_plan)', () => {
      it('should add health plan when authenticated', (done) => {
        chaiRequest
          .request(testApp)
          .patch('/user/update/health_plan')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Accept', 'application/json')
          .send(healthPlanData)
          .end((err: any, res: any) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('message').include('Health plan added successfully');
            done();
          });
      });
    });

    describe('🗑️ Account Deletion (DELETE /user/delete)', () => {
      it('should delete user account when authenticated', (done) => {
        chaiRequest
          .request(testApp)
          .delete('/user/delete')
          .set('Authorization', `Bearer ${userToken}`)
          .set('Accept', 'application/json')
          .end((err: any, res: any) => {
            expect(err).to.be.null;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(true);
            res.body.should.have.property('message').include('Account deleted successfully');
            done();
          });
      });

      it('should reject deletion without authentication', (done) => {
        chaiRequest
          .request(testApp)
          .delete('/user/delete')
          .end((err: any, res: any) => {
            expect(err).to.be.null;
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('success').eql(false);
            done();
          });
      });
    });
  });

  describe('❌ Error Handling', () => {
    it('should return 404 for non-existent endpoints', (done) => {
      chaiRequest
        .request(testApp)
        .get('/non-existent-endpoint')
        .end((err: any, res: any) => {
          expect(err).to.be.null;
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('success').eql(false);
          res.body.should.have.property('error').include('not found');
          done();
        });
    });
  });
});