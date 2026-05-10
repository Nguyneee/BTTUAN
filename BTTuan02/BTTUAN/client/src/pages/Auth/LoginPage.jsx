import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Form, Button } from 'react-bootstrap';
import { FiMail, FiLock } from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(form);
  };

  return (
    <div className="auth-page">
      <Container className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-logo">🧠</span>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Sign in to your Memoris account</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-custom">Email</Form.Label>
              <div className="input-wrapper-dark">
                <FiMail className="input-icon-dark" />
                <Form.Control
                  type="email"
                  id="login-email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
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
                  id="login-password"
                  placeholder="Your password"
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
              id="login-submit-btn"
            >
              {loading && <span className="spinner-border spinner-border-sm me-2" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
