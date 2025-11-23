const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults({
  static: 'public',
});

// CORS configuration for production
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Request logger middleware
server.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Register endpoint
server.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }

  const db = router.db;
  const existing = db.get('users').find({ email }).value();
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const users = db.get('users');
  const id = (users.value().reduce((max, u) => Math.max(max, u.id), 0) || 0) + 1;
  const user = { id, name, email, password };
  users.push(user).write();

  return res.status(201).json({ token: `fake-jwt-token-${id}`, user: { id, name, email } });
});

// Login endpoint
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  console.log('🔐 LOGIN REQUEST:', { email, passwordLength: password?.length });
  
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const db = router.db;
  const user = db.get('users').find({ email, password }).value();
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  console.log('✅ Login bem-sucedido para:', user.name);
  return res.json({ 
    token: `fake-jwt-token-${user.id}`, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email,
      phone: user.phone,
      birthDate: user.birthDate,
      address: user.address,
      profileImage: user.profileImage,
      notifications: user.notifications,
      promotions: user.promotions
    } 
  });
});

// Store Admin Login endpoint
server.post('/auth/store-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const db = router.db;
  const admin = db.get('storeAdmins').find({ email, password }).value();
  if (!admin) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ 
    token: `fake-admin-token-${admin.id}`, 
    user: { 
      id: admin.id, 
      name: admin.name, 
      email: admin.email, 
      role: admin.role,
      storeName: admin.storeName,
      phone: admin.phone,
      profileImage: admin.profileImage
    } 
  });
});

// Update profile endpoint
server.post('/auth/update', (req, res) => {
  const { token, name, email, password, phone, birthDate, address, profileImage, notifications, promotions } = req.body;
  if (!token) return res.status(401).json({ message: 'token required' });
  const match = token.match(/fake-jwt-token-(\d+)/);
  if (!match) return res.status(401).json({ message: 'invalid token' });
  const userId = parseInt(match[1], 10);
  const db = router.db;
  const user = db.get('users').find({ id: userId }).value();
  if (!user) return res.status(404).json({ message: 'user not found' });

  const updates = {};
  if (name) updates.name = name;
  if (email) {
    const existingEmail = db.get('users').find({ email }).value();
    if (existingEmail && existingEmail.id !== userId) {
      return res.status(409).json({ message: 'Email já usado' });
    }
    updates.email = email;
  }
  if (password) updates.password = password;
  if (phone !== undefined) updates.phone = phone;
  if (birthDate !== undefined) updates.birthDate = birthDate;
  if (address !== undefined) updates.address = address;
  if (profileImage !== undefined) updates.profileImage = profileImage;
  if (notifications !== undefined) updates.notifications = notifications;
  if (promotions !== undefined) updates.promotions = promotions;

  db.get('users').find({ id: userId }).assign(updates).write();
  const updated = db.get('users').find({ id: userId }).value();
  const userData = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    birthDate: updated.birthDate,
    address: updated.address,
    profileImage: updated.profileImage,
    notifications: updated.notifications,
    promotions: updated.promotions,
  };
  return res.json({ user: userData });
});

// Update admin profile endpoint
server.post('/auth/admin-update', (req, res) => {
  const { token, name, email, password, phone, storeName, profileImage } = req.body;
  if (!token) return res.status(401).json({ message: 'token required' });
  const match = token.match(/fake-admin-token-(\d+)/);
  if (!match) return res.status(401).json({ message: 'invalid token' });
  const adminId = parseInt(match[1], 10);
  const db = router.db;
  const admin = db.get('storeAdmins').find({ id: adminId }).value();
  if (!admin) return res.status(404).json({ message: 'admin not found' });

  const updates = {};
  if (name) updates.name = name;
  if (email) {
    const existingEmail = db.get('storeAdmins').find({ email }).value();
    if (existingEmail && existingEmail.id !== adminId) {
      return res.status(409).json({ message: 'Email já usado' });
    }
    updates.email = email;
  }
  if (password) updates.password = password;
  if (phone !== undefined) updates.phone = phone;
  if (storeName !== undefined) updates.storeName = storeName;
  if (profileImage !== undefined) updates.profileImage = profileImage;

  db.get('storeAdmins').find({ id: adminId }).assign(updates).write();
  const updated = db.get('storeAdmins').find({ id: adminId }).value();
  const adminData = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone,
    storeName: updated.storeName,
    role: updated.role,
    profileImage: updated.profileImage,
  };
  return res.json({ user: adminData });
});

// Initialize collections
const baseDb = router.db;
['notifications','appointments','promotions','services'].forEach((coll) => {
  if (!baseDb.has(coll).value()) {
    baseDb.set(coll, []).write();
  }
});

function nextId(collection) {
  const arr = baseDb.get(collection).value();
  return (arr.reduce((m, o) => Math.max(m, o.id), 0) || 0) + 1;
}

function createNotification({ userId, type, title, message, relatedId = null, meta = {} }) {
  const id = nextId('notifications');
  const notif = {
    id,
    userId,
    type,
    title,
    message,
    relatedId,
    meta,
    read: false,
    createdAt: new Date().toISOString()
  };
  baseDb.get('notifications').push(notif).write();
  return notif;
}

// Criação de agendamento (por cliente)
server.post('/appointments', (req, res) => {
  const { userId, serviceName, date, time } = req.body;
  if (!userId || !serviceName || !date || !time) {
    return res.status(400).json({ message: 'userId, serviceName, date, time são obrigatórios' });
  }
  const id = nextId('appointments');
  const appointment = { id, userId, serviceName, date, time, status: 'pending', createdAt: new Date().toISOString() };
  baseDb.get('appointments').push(appointment).write();
  createNotification({
    userId,
    type: 'appointment_created',
    title: 'Agendamento solicitado',
    message: `Seu agendamento de ${serviceName} foi solicitado para ${date} às ${time}.`,
    relatedId: id
  });
  const admins = baseDb.get('storeAdmins').value();
  admins.forEach(admin => {
    createNotification({
      userId: admin.id,
      type: 'appointment_new_request',
      title: 'Novo agendamento',
      message: `Cliente solicitou agendamento: ${serviceName} em ${date} às ${time}.`,
      relatedId: id,
      meta: { isStoreNotification: true }
    });
  });
  return res.status(201).json({ appointment });
});

// Criação de agendamento (pela loja)
server.post('/store/appointments', (req, res) => {
  const { userId, serviceName, date, time } = req.body;
  if (!userId || !serviceName || !date || !time) {
    return res.status(400).json({ message: 'userId, serviceName, date, time são obrigatórios' });
  }
  const id = nextId('appointments');
  const appointment = { id, userId, serviceName, date, time, status: 'confirmed', createdAt: new Date().toISOString() };
  baseDb.get('appointments').push(appointment).write();
  createNotification({
    userId,
    type: 'appointment_created',
    title: 'Agendamento confirmado',
    message: `Seu agendamento de ${serviceName} foi confirmado para ${date} às ${time}.`,
    relatedId: id
  });
  return res.status(201).json({ appointment });
});

// Reagendar
server.post('/appointments/:id/reschedule', (req, res) => {
  const { id } = req.params;
  const { date, time, initiatedBy } = req.body;
  if (!date || !time) return res.status(400).json({ message: 'date e time obrigatórios' });
  const appt = baseDb.get('appointments').find({ id: parseInt(id,10) }).value();
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  const oldDate = appt.date;
  const oldTime = appt.time;
  baseDb.get('appointments').find({ id: appt.id }).assign({ date, time }).write();
  createNotification({
    userId: appt.userId,
    type: 'appointment_rescheduled',
    title: 'Agendamento reagendado',
    message: `Seu agendamento de ${appt.serviceName} foi reagendado para ${date} às ${time}.`,
    relatedId: appt.id,
    meta: { oldDate, oldTime }
  });
  if (initiatedBy === 'client') {
    const admins = baseDb.get('storeAdmins').value();
    admins.forEach(admin => {
      createNotification({
        userId: admin.id,
        type: 'appointment_rescheduled_by_client',
        title: 'Agendamento reagendado',
        message: `Cliente reagendou ${appt.serviceName} de ${oldDate} ${oldTime} para ${date} às ${time}.`,
        relatedId: appt.id,
        meta: { isStoreNotification: true, oldDate, oldTime }
      });
    });
  }
  return res.json({ appointment: baseDb.get('appointments').find({ id: appt.id }).value() });
});

// Cancelar
server.post('/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const { initiatedBy } = req.body;
  const appt = baseDb.get('appointments').find({ id: parseInt(id,10) }).value();
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  baseDb.get('appointments').find({ id: appt.id }).assign({ status: 'cancelled' }).write();
  createNotification({
    userId: appt.userId,
    type: 'appointment_cancelled',
    title: 'Agendamento cancelado',
    message: `Seu agendamento de ${appt.serviceName} em ${appt.date} às ${appt.time} foi cancelado.`,
    relatedId: appt.id
  });
  if (initiatedBy === 'client') {
    const admins = baseDb.get('storeAdmins').value();
    admins.forEach(admin => {
      createNotification({
        userId: admin.id,
        type: 'appointment_cancelled_by_client',
        title: 'Agendamento cancelado',
        message: `Cliente cancelou agendamento: ${appt.serviceName} em ${appt.date} às ${appt.time}.`,
        relatedId: appt.id,
        meta: { isStoreNotification: true }
      });
    });
  }
  return res.json({ appointment: baseDb.get('appointments').find({ id: appt.id }).value() });
});

// Listar agendamentos
server.get('/appointments', (req, res) => {
  const { userId, status } = req.query;
  let query = baseDb.get('appointments');
  if (userId) query = query.filter({ userId: parseInt(userId, 10) });
  if (status) query = query.filter({ status });
  const list = query.sortBy('createdAt').value().reverse();
  return res.json(list);
});

// Nova promoção
server.post('/store/promotions', (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ message: 'title obrigatório' });
  const id = nextId('promotions');
  const promo = { id, title, description: description || '', createdAt: new Date().toISOString() };
  baseDb.get('promotions').push(promo).write();
  const users = baseDb.get('users').value();
  users.forEach(u => {
    if (u.promotions === undefined || u.promotions === true) {
      createNotification({
        userId: u.id,
        type: 'promotion_new',
        title: 'Nova promoção',
        message: `Promoção disponível: ${title}.`,
        relatedId: id
      });
    }
  });
  return res.status(201).json({ promotion: promo });
});

// Novo serviço
server.post('/store/services', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'name obrigatório' });
  const id = nextId('services');
  const service = { id, name, description: description || '', createdAt: new Date().toISOString() };
  baseDb.get('services').push(service).write();
  const users = baseDb.get('users').value();
  users.forEach(u => {
    createNotification({
      userId: u.id,
      type: 'service_new',
      title: 'Novo serviço',
      message: `Novo serviço adicionado: ${name}.`,
      relatedId: id
    });
  });
  return res.status(201).json({ service });
});

// Listar notificações
server.get('/notifications', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId obrigatório' });
  const list = baseDb.get('notifications')
    .filter({ userId: parseInt(userId,10) })
    .sortBy('createdAt')
    .value()
    .reverse();
  return res.json({ notifications: list });
});

// Marcar notificação como lida
server.post('/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const notif = baseDb.get('notifications').find({ id: parseInt(id,10) }).value();
  if (!notif) return res.status(404).json({ message: 'Notificação não encontrada' });
  baseDb.get('notifications').find({ id: notif.id }).assign({ read: true }).write();
  return res.json({ notification: baseDb.get('notifications').find({ id: notif.id }).value() });
});

// Marcar todas como lidas
server.post('/notifications/read-all', (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: 'userId obrigatório' });
  baseDb.get('notifications')
    .filter({ userId: parseInt(userId,10) })
    .each(n => { n.read = true; })
    .write();
  return res.json({ success: true });
});

// PATCH appointment
server.patch('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const appt = baseDb.get('appointments').find({ id: parseInt(id, 10) }).value();
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  
  baseDb.get('appointments').find({ id: appt.id }).assign({ status }).write();
  
  if (status === 'confirmed') {
    createNotification({
      userId: appt.userId,
      type: 'appointment_confirmed',
      title: 'Agendamento confirmado',
      message: `Seu agendamento de ${appt.serviceName} foi confirmado para ${appt.date} às ${appt.time}.`,
      relatedId: appt.id
    });
  } else if (status === 'cancelled') {
    createNotification({
      userId: appt.userId,
      type: 'appointment_cancelled',
      title: 'Agendamento cancelado',
      message: `Seu agendamento de ${appt.serviceName} em ${appt.date} às ${appt.time} foi cancelado.`,
      relatedId: appt.id
    });
  }
  
  return res.json({ appointment: baseDb.get('appointments').find({ id: appt.id }).value() });
});

// DELETE endpoints
server.delete('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const appt = baseDb.get('appointments').find({ id: parseInt(id, 10) }).value();
  if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
  baseDb.get('appointments').remove({ id: appt.id }).write();
  return res.json({ success: true, message: 'Agendamento excluído' });
});

server.delete('/promotions/:id', (req, res) => {
  const { id } = req.params;
  const promo = baseDb.get('promotions').find({ id: parseInt(id, 10) }).value();
  if (!promo) return res.status(404).json({ message: 'Promoção não encontrada' });
  baseDb.get('promotions').remove({ id: promo.id }).write();
  return res.json({ success: true, message: 'Promoção excluída' });
});

server.delete('/services/:id', (req, res) => {
  const { id } = req.params;
  const service = baseDb.get('services').find({ id: parseInt(id, 10) }).value();
  if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });
  baseDb.get('services').remove({ id: service.id }).write();
  return res.json({ success: true, message: 'Serviço excluído' });
});

server.use(router);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ JSON Server is running on port ${PORT}`);
});
