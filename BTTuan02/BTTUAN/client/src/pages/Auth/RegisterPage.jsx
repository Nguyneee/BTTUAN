import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const [form, setForm] = useState({ email: '', username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">🧠</span>
            <h1 className="auth-title">Create account</h1>
            <p className="auth-subtitle">Join Memoris and start learning smarter</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <div className="input-wrapper-dark">
                <FiMail className="input-icon-dark" />
                <Form.Control
                  type="email"
                  id="register-email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="auth-input-dark padded"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Username</Form.Label>
              <div className="input-wrapper-dark">
                <FiUser className="input-icon-dark" />
                <Form.Control
                  type="text"
                  id="register-username"
                  placeholder="Your username"
                  value={form.username}
                  onChange={(e) => setForm(p => ({ ...p, username: e.target.value }))}
                  className="auth-input-dark padded"
                  required
                />
              </div>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="form-label-custom">Password</Form.Label>
              <div className="input-wrapper-dark">
                <FiLock className="input-icon-dark" />
                <Form.Control
                  type="password"
                  id="register-password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
                  className="auth-input-dark padded"
                  required
                />
              </div>
            </Form.Group>

            <Button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
              id="register-submit-btn"
            >
              {loading && <span className="spinner-border spinner-border-sm me-2" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </Form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
