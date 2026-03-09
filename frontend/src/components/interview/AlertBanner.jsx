import { AlertTriangle, AlertCircle, X } from 'lucide-react';

export default function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`alert-banner ${alert.severity === 'critical' ? 'critical' : 'warning'}`}
        >
          {alert.severity === 'critical' ? (
            <AlertCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span className="alert-message">{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
