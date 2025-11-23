require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');

// Models
const User = require('./models/User');
const StoreAdmin = require('./models/StoreAdmin');
const Service = require('./models/Service');
const Promotion = require('./models/Promotion');
const Appointment = require('./models/Appointment');
const Feedback = require('./models/Feedback');
const Notification = require('./models/Notification');

const app = express();

// Connect to MongoDB
connectDB();

// Auto-seed on first run
let isSeeded = false;

async function autoSeed() {
  if (isSeeded) return;
  
  try {
    const userCount = await User.countDocuments();
    const adminCount = await StoreAdmin.countDocuments();
    const serviceCount = await Service.countDocuments();
    
    // Se já tem dados, não faz seed
    if (userCount > 0 || adminCount > 0 || serviceCount > 0) {
      console.log('✅ Banco já contém dados. Seed não necessário.');
      isSeeded = true;
      return;
    }
    
    console.log('🌱 Primeira execução detectada. Populando banco...');
    
    // Criar admin
    await StoreAdmin.create({
      id: 1,
      name: 'Administrador GlowMana',
      email: 'admin@glowmana.com',
      password: 'admin123',
      role: 'admin',
      storeName: 'GlowMana Salão',
      phone: '(11) 98765-4321'
    });

    // Criar usuário demo
    await User.create({
      id: 1,
      name: 'Maria Silva',
      email: 'maria@exemplo.com',
      password: 'senha123',
      phone: '(11) 91234-5678',
      birthDate: '1990-05-15',
      address: 'Rua das Flores, 123',
      notifications: true,
      promotions: true
    });

    // Criar serviços
    await Service.insertMany([
      { id: 1, name: 'Corte Feminino', description: 'Corte profissional com lavagem e finalização', price: 80, duration: 60 },
      { id: 2, name: 'Hidratação Profunda', description: 'Tratamento intensivo para cabelos danificados', price: 120, duration: 90 },
      { id: 3, name: 'Coloração', description: 'Coloração completa com produtos de qualidade', price: 150, duration: 120 },
      { id: 4, name: 'Manicure e Pedicure', description: 'Cuidados completos para mãos e pés', price: 50, duration: 60 },
      { id: 5, name: 'Design de Sobrancelhas', description: 'Modelagem e design profissional', price: 40, duration: 30 }
    ]);

    // Criar promoção
    await Promotion.create({
      id: 1,
      title: 'Promoção de Novembro',
      description: '20% de desconto em hidratações durante todo o mês!',
      discount: 20,
      validUntil: '2025-11-30'
    });

    console.log('✅ Banco populado com sucesso!');
    console.log('📊 Dados criados: 1 admin, 1 usuário, 5 serviços, 1 promoção');
    isSeeded = true;
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
  }
}

// Executar seed após conectar
setTimeout(autoSeed, 2000);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Helper functions
async function getNextId(Model) {
  const lastDoc = await Model.findOne().sort({ id: -1 });
  return lastDoc ? lastDoc.id + 1 : 1;
}

async function createNotification({ userId, type, title, message, relatedId = null, meta = {} }) {
  const id = await getNextId(Notification);
  const notif = await Notification.create({
    id,
    userId,
    type,
    title,
    message,
    relatedId,
    meta,
    read: false
  });
  return notif;
}

// ==================== AUTH ENDPOINTS ====================

// Register
app.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const id = await getNextId(User);
    const user = await User.create({ id, name, email, password });

    return res.status(201).json({ 
      token: `fake-jwt-token-${id}`, 
      user: { id, name, email } 
    });
  } catch (error) {
    console.error('Error in /auth/register:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 LOGIN REQUEST:', { email, passwordLength: password?.length });
    
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email, password });
    
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
  } catch (error) {
    console.error('Error in /auth/login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Store Admin Login
app.post('/auth/store-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const admin = await StoreAdmin.findOne({ email, password });
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
  } catch (error) {
    console.error('Error in /auth/store-login:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
app.post('/auth/update', async (req, res) => {
  try {
    const { token, name, email, password, phone, birthDate, address, profileImage, notifications, promotions } = req.body;
    if (!token) return res.status(401).json({ message: 'token required' });
    
    const match = token.match(/fake-jwt-token-(\\d+)/);
    if (!match) return res.status(401).json({ message: 'invalid token' });
    
    const userId = parseInt(match[1], 10);
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: 'user not found' });

    const updates = {};
    if (name) updates.name = name;
    if (email) {
      const existingEmail = await User.findOne({ email });
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

    await User.updateOne({ id: userId }, updates);
    const updated = await User.findOne({ id: userId });
    
    return res.json({ 
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        birthDate: updated.birthDate,
        address: updated.address,
        profileImage: updated.profileImage,
        notifications: updated.notifications,
        promotions: updated.promotions,
      }
    });
  } catch (error) {
    console.error('Error in /auth/update:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update admin profile
app.post('/auth/admin-update', async (req, res) => {
  try {
    const { token, name, email, password, phone, storeName, profileImage } = req.body;
    if (!token) return res.status(401).json({ message: 'token required' });
    
    const match = token.match(/fake-admin-token-(\\d+)/);
    if (!match) return res.status(401).json({ message: 'invalid token' });
    
    const adminId = parseInt(match[1], 10);
    const admin = await StoreAdmin.findOne({ id: adminId });
    if (!admin) return res.status(404).json({ message: 'admin not found' });

    const updates = {};
    if (name) updates.name = name;
    if (email) {
      const existingEmail = await StoreAdmin.findOne({ email });
      if (existingEmail && existingEmail.id !== adminId) {
        return res.status(409).json({ message: 'Email já usado' });
      }
      updates.email = email;
    }
    if (password) updates.password = password;
    if (phone !== undefined) updates.phone = phone;
    if (storeName !== undefined) updates.storeName = storeName;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    await StoreAdmin.updateOne({ id: adminId }, updates);
    const updated = await StoreAdmin.findOne({ id: adminId });
    
    return res.json({ 
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        storeName: updated.storeName,
        role: updated.role,
        profileImage: updated.profileImage,
      }
    });
  } catch (error) {
    console.error('Error in /auth/admin-update:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== APPOINTMENTS ====================

// Create appointment (by client)
app.post('/appointments', async (req, res) => {
  try {
    const { userId, serviceName, date, time } = req.body;
    if (!userId || !serviceName || !date || !time) {
      return res.status(400).json({ message: 'userId, serviceName, date, time são obrigatórios' });
    }
    
    const id = await getNextId(Appointment);
    const nowIso = new Date().toISOString();
    const appointment = await Appointment.create({
      id,
      userId,
      serviceName,
      date,
      time,
      status: 'pending',
      statusHistory: [{ status: 'pending', at: nowIso }]
    });

    await createNotification({
      userId,
      type: 'appointment_created',
      title: 'Agendamento solicitado',
      message: `Seu agendamento de ${serviceName} foi solicitado para ${date} às ${time}.`,
      relatedId: id
    });

    const admins = await StoreAdmin.find({});
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: 'appointment_new_request',
        title: 'Novo agendamento',
        message: `Cliente solicitou agendamento: ${serviceName} em ${date} às ${time}.`,
        relatedId: id,
        meta: { isStoreNotification: true }
      });
    }

    return res.status(201).json({ appointment });
  } catch (error) {
    console.error('Error in POST /appointments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create appointment (by store)
app.post('/store/appointments', async (req, res) => {
  try {
    const { userId, serviceName, date, time } = req.body;
    if (!userId || !serviceName || !date || !time) {
      return res.status(400).json({ message: 'userId, serviceName, date, time são obrigatórios' });
    }
    
    const id = await getNextId(Appointment);
    const nowIso = new Date().toISOString();
    const appointment = await Appointment.create({
      id,
      userId,
      serviceName,
      date,
      time,
      status: 'confirmed',
      statusHistory: [{ status: 'confirmed', at: nowIso }]
    });

    await createNotification({
      userId,
      type: 'appointment_created',
      title: 'Agendamento confirmado',
      message: `Seu agendamento de ${serviceName} foi confirmado para ${date} às ${time}.`,
      relatedId: id
    });

    return res.status(201).json({ appointment });
  } catch (error) {
    console.error('Error in POST /store/appointments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Reschedule appointment
app.post('/appointments/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, initiatedBy } = req.body;
    if (!date || !time) return res.status(400).json({ message: 'date e time obrigatórios' });
    
    const appt = await Appointment.findOne({ id: parseInt(id, 10) });
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
    
    const oldDate = appt.date;
    const oldTime = appt.time;
    
    await Appointment.updateOne({ id: appt.id }, { date, time });
    
    await createNotification({
      userId: appt.userId,
      type: 'appointment_rescheduled',
      title: 'Agendamento reagendado',
      message: `Seu agendamento de ${appt.serviceName} foi reagendado para ${date} às ${time}.`,
      relatedId: appt.id,
      meta: { oldDate, oldTime }
    });

    if (initiatedBy === 'client') {
      const admins = await StoreAdmin.find({});
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'appointment_rescheduled_by_client',
          title: 'Agendamento reagendado',
          message: `Cliente reagendou ${appt.serviceName} de ${oldDate} ${oldTime} para ${date} às ${time}.`,
          relatedId: appt.id,
          meta: { isStoreNotification: true, oldDate, oldTime }
        });
      }
    }

    const updated = await Appointment.findOne({ id: appt.id });
    return res.json({ appointment: updated });
  } catch (error) {
    console.error('Error in POST /appointments/:id/reschedule:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Cancel appointment
app.post('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { initiatedBy } = req.body;
    
    const appt = await Appointment.findOne({ id: parseInt(id, 10) });
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
    
    const nowIso = new Date().toISOString();
    const hist = appt.statusHistory || [];
    hist.push({ status: 'cancelled', at: nowIso });
    
    await Appointment.updateOne(
      { id: appt.id },
      { 
        status: 'cancelled', 
        cancelledAt: nowIso, 
        statusHistory: hist 
      }
    );

    await createNotification({
      userId: appt.userId,
      type: 'appointment_cancelled',
      title: 'Agendamento cancelado',
      message: `Seu agendamento de ${appt.serviceName} em ${appt.date} às ${appt.time} foi cancelado.`,
      relatedId: appt.id
    });

    if (initiatedBy === 'client') {
      const admins = await StoreAdmin.find({});
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'appointment_cancelled_by_client',
          title: 'Agendamento cancelado',
          message: `Cliente cancelou agendamento: ${appt.serviceName} em ${appt.date} às ${appt.time}.`,
          relatedId: appt.id,
          meta: { isStoreNotification: true }
        });
      }
    }

    const updated = await Appointment.findOne({ id: appt.id });
    return res.json({ appointment: updated });
  } catch (error) {
    console.error('Error in POST /appointments/:id/cancel:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// List appointments
app.get('/appointments', async (req, res) => {
  try {
    const { userId, status } = req.query;
    let query = {};
    if (userId) query.userId = parseInt(userId, 10);
    if (status) query.status = status;
    
    const list = await Appointment.find(query).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    console.error('Error in GET /appointments:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH appointment
app.patch('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appt = await Appointment.findOne({ id: parseInt(id, 10) });
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
    
    const hist = appt.statusHistory || [];
    const nowIso = new Date().toISOString();
    hist.push({ status, at: nowIso });
    
    const patchData = { status, statusHistory: hist };
    if (status === 'cancelled') patchData.cancelledAt = nowIso;
    
    await Appointment.updateOne({ id: appt.id }, patchData);

    if (status === 'confirmed') {
      await createNotification({
        userId: appt.userId,
        type: 'appointment_confirmed',
        title: 'Agendamento confirmado',
        message: `Seu agendamento de ${appt.serviceName} foi confirmado para ${appt.date} às ${appt.time}.`,
        relatedId: appt.id
      });
    } else if (status === 'cancelled') {
      await createNotification({
        userId: appt.userId,
        type: 'appointment_cancelled',
        title: 'Agendamento cancelado',
        message: `Seu agendamento de ${appt.serviceName} em ${appt.date} às ${appt.time} foi cancelado.`,
        relatedId: appt.id
      });
    }
    
    const updated = await Appointment.findOne({ id: appt.id });
    return res.json({ appointment: updated });
  } catch (error) {
    console.error('Error in PATCH /appointments/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete appointment
app.delete('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findOne({ id: parseInt(id, 10) });
    if (!appt) return res.status(404).json({ message: 'Agendamento não encontrado' });
    
    await Appointment.deleteOne({ id: appt.id });
    return res.json({ success: true, message: 'Agendamento excluído' });
  } catch (error) {
    console.error('Error in DELETE /appointments/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SERVICES ====================

// List services
app.get('/services', async (req, res) => {
  try {
    const services = await Service.find({}).sort({ createdAt: -1 });
    return res.json(services);
  } catch (error) {
    console.error('Error in GET /services:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create service
app.post('/store/services', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'name obrigatório' });
    
    const id = await getNextId(Service);
    const service = await Service.create({ 
      id, 
      name, 
      description: description || '' 
    });

    const users = await User.find({});
    for (const u of users) {
      await createNotification({
        userId: u.id,
        type: 'service_new',
        title: 'Novo serviço',
        message: `Novo serviço adicionado: ${name}.`,
        relatedId: id
      });
    }

    return res.status(201).json({ service });
  } catch (error) {
    console.error('Error in POST /store/services:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete service
app.delete('/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ id: parseInt(id, 10) });
    if (!service) return res.status(404).json({ message: 'Serviço não encontrado' });
    
    await Service.deleteOne({ id: service.id });
    return res.json({ success: true, message: 'Serviço excluído' });
  } catch (error) {
    console.error('Error in DELETE /services/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== PROMOTIONS ====================

// List promotions
app.get('/promotions', async (req, res) => {
  try {
    const promotions = await Promotion.find({}).sort({ createdAt: -1 });
    return res.json(promotions);
  } catch (error) {
    console.error('Error in GET /promotions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create promotion
app.post('/store/promotions', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ message: 'title obrigatório' });
    
    const id = await getNextId(Promotion);
    const promo = await Promotion.create({ 
      id, 
      title, 
      description: description || '' 
    });

    const users = await User.find({});
    for (const u of users) {
      if (u.promotions === undefined || u.promotions === true) {
        await createNotification({
          userId: u.id,
          type: 'promotion_new',
          title: 'Nova promoção',
          message: `Promoção disponível: ${title}.`,
          relatedId: id
        });
      }
    }

    return res.status(201).json({ promotion: promo });
  } catch (error) {
    console.error('Error in POST /store/promotions:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete promotion
app.delete('/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const promo = await Promotion.findOne({ id: parseInt(id, 10) });
    if (!promo) return res.status(404).json({ message: 'Promoção não encontrada' });
    
    await Promotion.deleteOne({ id: promo.id });
    return res.json({ success: true, message: 'Promoção excluída' });
  } catch (error) {
    console.error('Error in DELETE /promotions/:id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== NOTIFICATIONS ====================

// List notifications
app.get('/notifications', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'userId obrigatório' });
    
    const list = await Notification.find({ userId: parseInt(userId, 10) }).sort({ createdAt: -1 });
    return res.json({ notifications: list });
  } catch (error) {
    console.error('Error in GET /notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
app.post('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findOne({ id: parseInt(id, 10) });
    if (!notif) return res.status(404).json({ message: 'Notificação não encontrada' });
    
    await Notification.updateOne({ id: notif.id }, { read: true });
    const updated = await Notification.findOne({ id: notif.id });
    
    return res.json({ notification: updated });
  } catch (error) {
    console.error('Error in POST /notifications/:id/read:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Mark all as read
app.post('/notifications/read-all', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId obrigatório' });
    
    await Notification.updateMany(
      { userId: parseInt(userId, 10) },
      { read: true }
    );
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /notifications/read-all:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== FEEDBACKS ====================

// List feedbacks
app.get('/feedbacks', async (req, res) => {
  try {
    const list = await Feedback.find({}).sort({ createdAt: -1 });
    return res.json(list);
  } catch (error) {
    console.error('Error in GET /feedbacks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Create feedback
app.post('/feedbacks', async (req, res) => {
  try {
    const { userId, nome, rating, comentario } = req.body;
    if (!userId || !nome || !rating) {
      return res.status(400).json({ message: 'Campos obrigatórios: userId, nome, rating' });
    }
    
    const id = await getNextId(Feedback);
    const now = new Date();
    const createdAt = now.toISOString();
    const date = createdAt.substring(0, 10);
    
    const fb = await Feedback.create({
      id,
      userId,
      nome,
      rating,
      comentario: comentario || '',
      date
    });

    return res.status(201).json(fb);
  } catch (error) {
    console.error('Error in POST /feedbacks:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== STATS ====================

function normalizeDateString(d) {
  if (!d) return null;
  const cleaned = d.replace(/\\//g, '-');
  return cleaned.substring(0, 10);
}

app.get('/stats/today', async (req, res) => {
  try {
    const today = new Date().toISOString().substring(0, 10);
    
    const appointments = await Appointment.find({});
    const feedbacks = await Feedback.find({});

    const todaysAppointments = appointments.filter(a => normalizeDateString(a.date) === today);
    const pending = todaysAppointments.filter(a => a.status === 'pending').length;
    const confirmed = todaysAppointments.filter(a => a.status === 'confirmed').length;
    const cancelled = todaysAppointments.filter(a => a.status === 'cancelled').length;
    const cancellationsToday = appointments.filter(a => a.cancelledAt && a.cancelledAt.substring(0, 10) === today).length;

    const todaysFeedbacks = feedbacks.filter(f => f.date === today).length;

    return res.json({
      date: today,
      appointments: {
        total: todaysAppointments.length,
        pending,
        confirmed,
        cancelled,
        cancellationsToday
      },
      feedbacks: {
        totalToday: todaysFeedbacks
      }
    });
  } catch (error) {
    console.error('Error in GET /stats/today:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SERVER ====================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
