import {
  Boxes,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  HardDrive,
  Headphones,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  PackageCheck,
  Plus,
  Search,
  Sparkles,
  TicketCheck,
  Warehouse,
  X,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { api } from './api';
import { AuthScreen } from './AuthScreen';
import type {
  Asset,
  AuthSession,
  AuthUser,
  InventoryItem,
  StockItem,
  Ticket,
  TicketStatus,
} from './types';

type Workspace = 'home' | 'tickets' | 'assets' | 'inventory' | 'stockroom';
const TOKEN_KEY = 'help-desk-access-token';

const navigation = [
  {
    id: 'home' as const,
    label: 'Home',
    eyebrow: 'Command center',
    description: 'The day at a glance.',
    icon: LayoutDashboard,
  },
  {
    id: 'tickets' as const,
    label: 'Tickets',
    eyebrow: 'Support queue',
    description: 'Track, triage, and resolve requests.',
    icon: TicketCheck,
  },
  {
    id: 'assets' as const,
    label: 'Assets',
    eyebrow: 'Device registry',
    description: 'Know what you own and who has it.',
    icon: HardDrive,
  },
  {
    id: 'inventory' as const,
    label: 'Inventory',
    eyebrow: 'Supply control',
    description: 'Keep essential items above threshold.',
    icon: Boxes,
  },
  {
    id: 'stockroom' as const,
    label: 'Stockroom',
    eyebrow: 'Quick counts',
    description: 'A simple view of available stock.',
    icon: Warehouse,
  },
];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const titleCase = (value: string) =>
  value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [active, setActive] = useState<Workspace>('home');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stockroom, setStockroom] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ticketData, assetData, inventoryData, stockData] = await Promise.all([
        api.getTickets(),
        api.getAssets(),
        api.getInventory(),
        api.getStockroom(),
      ]);
      setTickets(ticketData);
      setAssets(assetData);
      setInventory(inventoryData);
      setStockroom(stockData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load workspace data.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    api.setToken(null);
    setAuthUser(null);
    setTickets([]);
    setAssets([]);
    setInventory([]);
    setStockroom([]);
    setActive('home');
  };

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setCheckingAuth(false);
      return;
    }

    api.setToken(token);
    void api.getMe()
      .then((user) => {
        setAuthUser(user);
        return loadData();
      })
      .catch(logout)
      .finally(() => setCheckingAuth(false));
  }, []);

  useEffect(() => {
    window.addEventListener('auth:unauthorized', logout);
    return () => window.removeEventListener('auth:unauthorized', logout);
  }, []);

  const finishAuthentication = (session: AuthSession) => {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    api.setToken(session.accessToken);
    setAuthUser(session.user);
    void loadData();
  };

  if (checkingAuth) {
    return <div className="auth-loading"><LoaderCircle className="spin" size={28} /><span>Restoring your workspace…</span></div>;
  }

  if (!authUser) {
    return <AuthScreen onAuthenticated={finishAuthentication} />;
  }

  const selected = navigation.find((item) => item.id === active)!;
  const SelectedIcon = selected.icon;
  const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved').length;
  const lowStock = inventory.filter((item) => item.status !== 'In Stock').length;
  const assignedAssets = assets.filter((asset) => asset.assignedTo).length;

  const counts: Record<Workspace, number> = {
    home: openTickets + lowStock,
    tickets: tickets.length,
    assets: assets.length,
    inventory: inventory.length,
    stockroom: stockroom.length,
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return { tickets, assets, inventory, stockroom };
    return {
      tickets: tickets.filter((item) =>
        `${item.title} ${item.description} ${item.status}`.toLowerCase().includes(needle),
      ),
      assets: assets.filter((item) =>
        `${item.name} ${item.brand} ${item.model} ${item.assignedTo ?? ''} ${item.location}`
          .toLowerCase()
          .includes(needle),
      ),
      inventory: inventory.filter((item) =>
        `${item.name} ${item.category} ${item.status} ${item.location}`
          .toLowerCase()
          .includes(needle),
      ),
      stockroom: stockroom.filter((item) => item.name.toLowerCase().includes(needle)),
    };
  }, [assets, inventory, query, stockroom, tickets]);

  const switchWorkspace = (workspace: Workspace) => {
    setActive(workspace);
    setQuery('');
    setShowCreate(false);
    setFormError('');
  };

  const updateTicket = async (id: string, status: TicketStatus) => {
    try {
      const updated = await api.updateTicketStatus(id, status);
      setTickets((current) => current.map((ticket) => (ticket.id === id ? updated : ticket)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Unable to update ticket.');
    }
  };

  const submitCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setFormError('');
    const form = new FormData(event.currentTarget);
    try {
      if (active === 'tickets') {
        const created = await api.createTicket({
          title: String(form.get('title') ?? ''),
          description: String(form.get('description') ?? ''),
        });
        setTickets((current) => [created, ...current]);
      }
      if (active === 'assets') {
        const assignedTo = String(form.get('assignedTo') ?? '').trim();
        const created = await api.createAsset({
          name: String(form.get('name') ?? ''),
          brand: String(form.get('brand') ?? ''),
          model: String(form.get('model') ?? ''),
          specs: String(form.get('specs') ?? ''),
          assignedTo: assignedTo || null,
          status: String(form.get('status') ?? 'Available'),
          location: String(form.get('location') ?? ''),
        });
        setAssets((current) => [created, ...current]);
      }
      if (active === 'inventory') {
        const created = await api.createInventoryItem({
          name: String(form.get('name') ?? ''),
          category: String(form.get('category') ?? ''),
          quantity: Number(form.get('quantity')),
          reorderLevel: Number(form.get('reorderLevel')),
          unit: String(form.get('unit') ?? ''),
          location: String(form.get('location') ?? ''),
        });
        setInventory((current) => [created, ...current]);
      }
      if (active === 'stockroom') {
        const created = await api.createStockItem({
          name: String(form.get('name') ?? ''),
          quantity: Number(form.get('quantity')),
        });
        setStockroom((current) => [created, ...current]);
      }
      setShowCreate(false);
    } catch (createError) {
      setFormError(createError instanceof Error ? createError.message : 'Unable to save item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button className="brand" onClick={() => switchWorkspace('home')} aria-label="SKAI Technology Help Desk home">
          <img className="brand-logo" src="/brand/skai-white-logo.webp" alt="SKAI Technology" />
          <span className="brand-copy"><small>Help Desk</small></span>
        </button>
        <div className="sidebar-label">Workspace</div>
        <nav className="app-nav" aria-label="Primary navigation">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button key={item.id} className={isActive ? 'active' : ''} onClick={() => switchWorkspace(item.id)} aria-current={isActive ? 'page' : undefined}>
                <Icon size={19} />
                <span>{item.label}</span>
                {item.id !== 'home' && <small>{counts[item.id]}</small>}
                <ChevronRight size={15} />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-focus">
          <span><Sparkles size={15} /> Daily focus</span>
          <strong>{openTickets} tickets need attention</strong>
          <p>Keep the queue moving, one clear next step at a time.</p>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{authUser.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</span>
          <div><strong>{authUser.name}</strong><small>{authUser.email}</small></div>
          <button className="logout-button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div><span className="topbar-eyebrow">Northstar operations</span><strong>{selected.label}</strong></div>
          <div className="topbar-actions">
            <span className="connection"><span /> API connected</span>
            {active !== 'home' && <button className="primary-button compact" onClick={() => setShowCreate(true)}><Plus size={16} /> Add new</button>}
          </div>
        </header>

        <main id="top">
          {error && (
            <div className="error-banner"><CircleAlert size={18} /><span>{error}</span><button onClick={() => void loadData()}>Try again</button></div>
          )}

          {active === 'home' ? (
            <HomeDashboard
              loading={loading}
              tickets={tickets}
              assets={assets}
              inventory={inventory}
              stockroom={stockroom}
              openTickets={openTickets}
              assignedAssets={assignedAssets}
              lowStock={lowStock}
              onNavigate={switchWorkspace}
            />
          ) : (
            <section className="workspace-page">
              <div className="page-heading">
                <div>
                  <div className="kicker"><SelectedIcon size={14} /> {selected.eyebrow}</div>
                  <h1>{selected.label}</h1>
                  <p>{selected.description}</p>
                </div>
                <button className="primary-button" onClick={() => setShowCreate(true)}><Plus size={17} /> Add {active === 'inventory' ? 'item' : active.slice(0, -1)}</button>
              </div>

              <div className="workspace-card single-panel">
                <div className="workspace-content">
                  <div className="content-toolbar">
                    <label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${active}…`} /></label>
                    <span className="result-count">{filtered[active].length} results</span>
                  </div>
                  {loading ? (
                    <div className="state-panel"><LoaderCircle className="spin" size={24} /><span>Loading workspace…</span></div>
                  ) : (
                    <div className="data-panel">
                      {active === 'tickets' && <TicketList tickets={filtered.tickets} onStatusChange={updateTicket} />}
                      {active === 'assets' && <AssetList assets={filtered.assets} />}
                      {active === 'inventory' && <InventoryList inventory={filtered.inventory} />}
                      {active === 'stockroom' && <StockroomList stockroom={filtered.stockroom} />}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>

        <footer><span>Northstar Help Desk</span><span>Built for clear, unhurried operations.</span></footer>
      </div>

      {showCreate && active !== 'home' && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowCreate(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="section-label">Create record</span>
                <h2 id="create-title">Add {active === 'inventory' ? 'inventory item' : active.slice(0, -1)}</h2>
              </div>
              <button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={19} /></button>
            </div>
            <form onSubmit={submitCreate}>
              <CreateFields workspace={active} />
              {formError && <div className="form-error"><CircleAlert size={16} /> {formError}</div>}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? <LoaderCircle className="spin" size={17} /> : <Plus size={17} />}
                  {saving ? 'Saving…' : 'Create record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeDashboard({
  loading,
  tickets,
  assets,
  inventory,
  stockroom,
  openTickets,
  assignedAssets,
  lowStock,
  onNavigate,
}: {
  loading: boolean;
  tickets: Ticket[];
  assets: Asset[];
  inventory: InventoryItem[];
  stockroom: StockItem[];
  openTickets: number;
  assignedAssets: number;
  lowStock: number;
  onNavigate: (workspace: Workspace) => void;
}) {
  const activeTickets = tickets.filter((ticket) => ticket.status !== 'resolved').slice(0, 4);
  const recentAssets = assets.slice(0, 4);

  return (
    <div className="home-page">
      <section className="hero">
        <div>
          <div className="kicker"><Sparkles size={14} /> Operations overview</div>
          <h1>Everything your team needs,<br /><span>one calm workspace.</span></h1>
          <p>Resolve requests, track equipment, and keep supplies moving without losing the thread.</p>
          <button className="primary-button hero-action" onClick={() => onNavigate('tickets')}>Open support queue <ChevronRight size={17} /></button>
        </div>
        <div className="hero-orbit" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <div className="orbit-core"><Headphones size={28} /></div>
          <span className="orbit-label label-one">{openTickets} active</span>
          <span className="orbit-label label-two">{lowStock} alerts</span>
          <span className="orbit-dot dot-one" /><span className="orbit-dot dot-two" />
        </div>
      </section>

      <section className="metric-grid" aria-label="Help desk overview">
        <Metric icon={Inbox} label="Open tickets" value={openTickets} detail={`${tickets.length} total requests`} tone="red" />
        <Metric icon={HardDrive} label="Assigned assets" value={assignedAssets} detail={`${assets.length} registered devices`} />
        <Metric icon={CircleAlert} label="Stock alerts" value={lowStock} detail={`${inventory.length} inventory lines`} tone={lowStock ? 'amber' : 'default'} />
        <Metric icon={PackageCheck} label="Stockroom items" value={stockroom.length} detail="Live database count" />
      </section>

      {loading ? (
        <div className="state-panel home-loading"><LoaderCircle className="spin" size={24} /><span>Loading dashboard…</span></div>
      ) : (
        <section className="home-grid">
          <article className="overview-panel">
            <div className="panel-heading"><div><span className="section-label">Current queue</span><h2>Tickets needing attention</h2></div><button onClick={() => onNavigate('tickets')}>View all <ChevronRight size={15} /></button></div>
            {activeTickets.length ? (
              <div className="compact-list">
                {activeTickets.map((ticket) => (
                  <button key={ticket.id} className="compact-ticket" onClick={() => onNavigate('tickets')}>
                    <span className={`status-dot ${ticket.status}`} />
                    <span><strong>{ticket.title}</strong><small>{formatDate(ticket.createdAt)} · {titleCase(ticket.status)}</small></span>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            ) : <div className="mini-empty"><CheckCircle2 size={22} /><span>All caught up. No active tickets.</span></div>}
          </article>

          <article className="overview-panel">
            <div className="panel-heading"><div><span className="section-label">Asset registry</span><h2>Current equipment</h2></div><button onClick={() => onNavigate('assets')}>View all <ChevronRight size={15} /></button></div>
            {recentAssets.length ? (
              <div className="compact-list">
                {recentAssets.map((asset) => (
                  <button key={asset.id} className="compact-asset" onClick={() => onNavigate('assets')}>
                    <span className="device-icon"><HardDrive size={17} /></span>
                    <span><strong>{asset.name}</strong><small>{asset.assignedTo || 'Unassigned'} · {asset.location}</small></span>
                    <span className="badge neutral">{asset.status}</span>
                  </button>
                ))}
              </div>
            ) : <div className="mini-empty"><HardDrive size={22} /><span>No assets registered yet.</span></div>}
          </article>
        </section>
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail, tone = 'default' }: { icon: typeof Inbox; label: string; value: number; detail: string; tone?: 'default' | 'red' | 'amber' }) {
  return (
    <article className={`metric-card ${tone}`}>
      <div className="metric-icon"><Icon size={19} /></div>
      <div><span>{label}</span><strong>{value.toString().padStart(2, '0')}</strong><small>{detail}</small></div>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return <div className="state-panel"><Inbox size={24} /><strong>No {label} found</strong><span>Create a record or adjust your search.</span></div>;
}

function TicketList({ tickets, onStatusChange }: { tickets: Ticket[]; onStatusChange: (id: string, status: TicketStatus) => void }) {
  if (!tickets.length) return <EmptyState label="tickets" />;
  return (
    <div className="record-list">
      {tickets.map((ticket) => (
        <article className="record ticket-record" key={ticket.id}>
          <span className={`status-dot ${ticket.status}`} />
          <div className="record-main">
            <div className="record-title-row"><h3>{ticket.title}</h3><span className={`badge ${ticket.status}`}>{titleCase(ticket.status)}</span></div>
            <p>{ticket.description}</p>
            <span className="record-meta">Opened {formatDate(ticket.createdAt)} · #{ticket.id.slice(0, 8)}</span>
          </div>
          <label className="status-select">
            <span>Status</span>
            <select value={ticket.status} onChange={(event) => onStatusChange(ticket.id, event.target.value as TicketStatus)}>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </label>
        </article>
      ))}
    </div>
  );
}

function AssetList({ assets }: { assets: Asset[] }) {
  if (!assets.length) return <EmptyState label="assets" />;
  return (
    <div className="card-grid">
      {assets.map((asset) => (
        <article className="asset-card" key={asset.id}>
          <div className="asset-top"><span className="device-icon"><HardDrive size={20} /></span><span className="badge neutral">{asset.status}</span></div>
          <h3>{asset.name}</h3>
          <p>{asset.brand} · {asset.model} · {asset.specs}</p>
          <dl>
            <div><dt>Assigned to</dt><dd>{asset.assignedTo || 'Unassigned'}</dd></div>
            <div><dt>Location</dt><dd>{asset.location}</dd></div>
          </dl>
          <span className="record-meta">Updated {formatDate(asset.lastUpdated)}</span>
        </article>
      ))}
    </div>
  );
}

function InventoryList({ inventory }: { inventory: InventoryItem[] }) {
  if (!inventory.length) return <EmptyState label="inventory items" />;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Item</th><th>Category</th><th>Available</th><th>Reorder at</th><th>Status</th><th>Location</th></tr></thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong><small>{item.unit}</small></td>
              <td>{item.category}</td>
              <td className="quantity-cell">{item.quantity}</td>
              <td>{item.reorderLevel}</td>
              <td><span className={`badge ${item.status.toLowerCase().replaceAll(' ', '-')}`}>{item.status}</span></td>
              <td>{item.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockroomList({ stockroom }: { stockroom: StockItem[] }) {
  if (!stockroom.length) return <EmptyState label="stockroom items" />;
  const max = Math.max(...stockroom.map((item) => item.quantity), 1);
  return (
    <div className="stock-list">
      {stockroom.map((item) => (
        <article key={item.id} className="stock-row">
          <span className="stock-icon"><PackageCheck size={18} /></span>
          <div className="stock-copy"><strong>{item.name}</strong><span>#{item.id.slice(0, 8)}</span></div>
          <div className="stock-meter"><span style={{ width: `${Math.max((item.quantity / max) * 100, 4)}%` }} /></div>
          <strong className="stock-quantity">{item.quantity}</strong>
        </article>
      ))}
    </div>
  );
}

function CreateFields({ workspace }: { workspace: Workspace }) {
  if (workspace === 'tickets') {
    return <div className="form-grid"><Field name="title" label="Title" placeholder="Briefly describe the issue" /><Field name="description" label="Description" placeholder="Add the useful context, symptoms, and impact" textarea full /></div>;
  }
  if (workspace === 'assets') {
    return (
      <div className="form-grid">
        <Field name="name" label="Asset name" placeholder="MacBook Pro 14”" />
        <Field name="brand" label="Brand" placeholder="Apple" />
        <Field name="model" label="Model" placeholder="M3 Pro" />
        <Field name="specs" label="Specifications" placeholder="18 GB / 512 GB" />
        <Field name="assignedTo" label="Assigned to" placeholder="Optional" required={false} />
        <Field name="status" label="Status" placeholder="Available" required={false} />
        <Field name="location" label="Location" placeholder="Main office · L2" full />
      </div>
    );
  }
  if (workspace === 'inventory') {
    return (
      <div className="form-grid">
        <Field name="name" label="Item name" placeholder="USB-C cable" />
        <Field name="category" label="Category" placeholder="Cables" />
        <Field name="quantity" label="Quantity" type="number" placeholder="0" />
        <Field name="reorderLevel" label="Reorder level" type="number" placeholder="10" />
        <Field name="unit" label="Unit" placeholder="pcs" />
        <Field name="location" label="Location" placeholder="Shelf A1" />
      </div>
    );
  }
  return <div className="form-grid"><Field name="name" label="Item name" placeholder="Keyboard" /><Field name="quantity" label="Quantity" type="number" placeholder="0" /></div>;
}

function Field({ name, label, placeholder, type = 'text', textarea = false, full = false, required = true }: { name: string; label: string; placeholder: string; type?: string; textarea?: boolean; full?: boolean; required?: boolean }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {textarea ? <textarea name={name} placeholder={placeholder} required={required} rows={5} /> : <input name={name} type={type} placeholder={placeholder} required={required} min={type === 'number' ? 0 : undefined} />}
    </label>
  );
}

export default App;
