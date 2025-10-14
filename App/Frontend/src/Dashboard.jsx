import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card.jsx';

export default function Dashboard() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      minHeight: '100vh',
      padding: '24px'
    }}>
      <div className="container space-y-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header className="space-y-2">
        <div className="flex items-center justify-between" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '16px 24px',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div className="flex items-center space-x-3">
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '0.875rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px 0 rgba(102, 126, 234, 0.3)'
            }}>
              EP
            </div>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#1e293b',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Event Platform
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'default'
            }}>
              Organizer
            </div>
            <button style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: '500',
              border: 'none',
              boxShadow: '0 4px 15px 0 rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(240, 147, 251, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 15px 0 rgba(240, 147, 251, 0.3)';
            }}>
              Settings
            </button>
          </div>
        </div>
        <Card style={{ 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #ef4444 100%)',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
        }}>
          <CardHeader style={{ padding: '32px' }}>
            <CardTitle style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              color: 'white', 
              marginBottom: '8px' 
            }}>
              Welcome To Your Event Inbox
            </CardTitle>
            <CardDescription style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '1rem' 
            }}>
              Create, manage, and submit your event drafts for review and approval.
            </CardDescription>
          </CardHeader>
        </Card>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <Card style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(102, 126, 234, 0.3)',
          color: 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(102, 126, 234, 0.3)';
        }}>
          <CardHeader style={{ padding: '20px' }}>
            <CardTitle style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              3
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              Next: React Advanced Workshop
            </div>
          </CardContent>
        </Card>
        <Card style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(240, 147, 251, 0.3)',
          color: 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(240, 147, 251, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(240, 147, 251, 0.3)';
        }}>
          <CardHeader style={{ padding: '20px' }}>
            <CardTitle style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>
              Active Sponsors
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              3
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              1 premium
            </div>
          </CardContent>
        </Card>
        <Card style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          border: 'none',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(79, 172, 254, 0.3)',
          color: 'white',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 20px 40px -5px rgba(79, 172, 254, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 172, 254, 0.3)';
        }}>
          <CardHeader style={{ padding: '20px' }}>
            <CardTitle style={{ fontSize: '1rem', fontWeight: '600', color: 'white' }}>
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              3
            </div>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              1 high priority
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
        }}>
          <CardHeader style={{ padding: '24px 24px 16px 24px' }}>
            <CardTitle style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              Upcoming Events
            </CardTitle>
            <CardDescription style={{ 
              fontSize: '0.875rem', 
              color: '#64748b' 
            }}>
              Your next events
            </CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Row title="React Advanced Workshop" date="2025-10-15" place="Tech Hub Building A" badge="workshop" color="#93c5fd" />
              <Row title="StartupX Conference 2025" date="2025-10-22" place="Convention Center" badge="conference" color="#f0abfc" />
              <Row title="AI Hackathon" date="2025-11-05" place="Innovation Lab" badge="hackathon" color="#86efac" />
            </div>
          </CardContent>
        </Card>

        <Card style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          transform: 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
        }}>
          <CardHeader style={{ padding: '24px 24px 16px 24px' }}>
            <CardTitle style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#1e293b',
              marginBottom: '4px'
            }}>
              Recent Announcements
            </CardTitle>
            <CardDescription style={{ 
              fontSize: '0.875rem', 
              color: '#64748b' 
            }}>
              Latest updates
            </CardDescription>
          </CardHeader>
          <CardContent style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Announcement title="New Event Registration System" severity="high" />
              <Announcement title="Campus Wi‑Fi Maintenance" severity="medium" />
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}


function Row({ title, date, place, badge, color }) {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid #f1f5f9'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#1e293b',
          marginBottom: '4px'
        }}>
          {title}
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#64748b' 
        }}>
          {date}  •  {place}
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span style={{ 
          background: color,
          color: '#1e293b',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '500'
        }}>
          {badge}
        </span>
        <button style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
        }}>
          View
        </button>
        <button style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
        }}>
          Edit
        </button>
        <button style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: 'scale(1)',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
        }}>
          Manage
        </button>
      </div>
    </div>
  );
}

function Announcement({ title, severity }) {
  const bg = severity === 'high' ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' : 
            severity === 'medium' ? 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)' : 
            'linear-gradient(135deg, #48cae4 0%, #0077b6 100%)';
  const color = 'white';
  
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.6)',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#1e293b' 
        }}>
          {title}
        </div>
        <span style={{ 
          background: bg, 
          color: color,
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {severity}
        </span>
      </div>
      <div style={{ 
        fontSize: '0.875rem', 
        color: '#64748b',
        marginBottom: '4px',
        lineHeight: '1.4'
      }}>
        We have upgraded our event registration system for better user experience.
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#94a3b8' 
      }}>
        2025-09-25 • Admin Team
      </div>
    </div>
  );
}
