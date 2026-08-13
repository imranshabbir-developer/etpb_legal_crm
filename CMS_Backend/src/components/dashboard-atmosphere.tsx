/** CRM login-inspired ambient background: mesh, cyan glow, network feel. */
export function DashboardAtmosphere() {
  return (
    <div className="dashboard-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="dashboard-crm-vignette absolute inset-0" />
      <div className="dashboard-mesh absolute inset-0" />
      <div className="dashboard-grid absolute inset-0" />
      <div className="dashboard-network-lines absolute inset-0" />
      <div className="dashboard-bubble dashboard-bubble-crm-cyan" />
      <div className="dashboard-bubble dashboard-bubble-crm-navy" />
      <div className="dashboard-bubble dashboard-bubble-crm-teal" />
      <div className="dashboard-bubble dashboard-bubble-crm-glow" />
    </div>
  );
}
