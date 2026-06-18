// ============================================================================
// SASI UI Kit — Login (magic-link)
// ============================================================================
function Login({ onEnter }) {
  const { Button, Input, Badge } = window.SASIComandoUTIDesignSystem_157e25;
  const [email, setEmail] = React.useState('');
  const [sent, setSent] = React.useState(false);
  return (
    <div className="sasi-login">
      <div className="sasi-login__card sasi-fade-in">
        <div className="sasi-login__brand">
          <div className="sasi-login__mark"><i data-lucide="activity"></i></div>
          <div>
            <b>SASI</b>
            <small>Comando UTI · 33 leitos</small>
          </div>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <i data-lucide="mail-check" style={{ width: 40, height: 40, color: 'var(--success)' }}></i>
            <p style={{ color: 'var(--text-body)', fontWeight: 600, margin: '10px 0 4px' }}>Link enviado para <span style={{ color: 'var(--text-heading)' }}>{email || 'seu e-mail'}</span></p>
            <p className="sasi-muted" style={{ fontSize: 'var(--text-sm)', margin: 0 }}>Abra o e-mail e clique no link mágico para entrar.</p>
            <Button variant="primary" block style={{ marginTop: 18 }} onClick={onEnter}>Entrar no painel (demo)</Button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input label="E-mail institucional" icon={<i data-lucide="mail"></i>} type="email" placeholder="dr.nicolas@hospital.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button variant="primary" block type="submit" icon={<i data-lucide="send"></i>}>Enviar link mágico</Button>
            <button type="button" onClick={onEnter} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 'var(--text-xs)', cursor: 'pointer', textDecoration: 'underline' }}>Pular para a demo →</button>
          </form>
        )}
        <div className="sasi-login__foot">
          <Badge tone="accent" variant="outline" icon={<i data-lucide="shield-check"></i>}>Sessão criptografada · LGPD · RLS por auth.uid()</Badge>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
