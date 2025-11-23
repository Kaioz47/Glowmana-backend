require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const StoreAdmin = require('./models/StoreAdmin');
const Service = require('./models/Service');
const Promotion = require('./models/Promotion');
const Appointment = require('./models/Appointment');
const Feedback = require('./models/Feedback');

const connectDB = require('./config/database');

const seedData = async () => {
  try {
    await connectDB();

    // Limpar coleções
    await User.deleteMany({});
    await StoreAdmin.deleteMany({});
    await Service.deleteMany({});
    await Promotion.deleteMany({});
    await Appointment.deleteMany({});
    await Feedback.deleteMany({});

    console.log('🗑️  Coleções limpas');

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
      {
        id: 1,
        name: 'Corte Feminino',
        description: 'Corte profissional com lavagem e finalização',
        price: 80,
        duration: 60
      },
      {
        id: 2,
        name: 'Hidratação Profunda',
        description: 'Tratamento intensivo para cabelos danificados',
        price: 120,
        duration: 90
      },
      {
        id: 3,
        name: 'Coloração',
        description: 'Coloração completa com produtos de qualidade',
        price: 150,
        duration: 120
      },
      {
        id: 4,
        name: 'Manicure e Pedicure',
        description: 'Cuidados completos para mãos e pés',
        price: 50,
        duration: 60
      },
      {
        id: 5,
        name: 'Design de Sobrancelhas',
        description: 'Modelagem e design profissional',
        price: 40,
        duration: 30
      }
    ]);

    // Criar promoção
    await Promotion.create({
      id: 1,
      title: 'Promoção de Novembro',
      description: '20% de desconto em hidratações durante todo o mês!',
      discount: 20,
      validUntil: '2025-11-30'
    });

    // Criar agendamento
    await Appointment.create({
      id: 1,
      userId: 1,
      serviceName: 'Corte Feminino',
      date: '2025-11-25',
      time: '14:00',
      status: 'confirmed',
      statusHistory: [
        {
          status: 'pending',
          at: '2025-11-20T10:00:00.000Z'
        },
        {
          status: 'confirmed',
          at: '2025-11-20T15:30:00.000Z'
        }
      ]
    });

    // Criar feedback
    await Feedback.create({
      id: 1,
      userId: 1,
      nome: 'Maria Silva',
      rating: 5,
      comentario: 'Excelente atendimento! Amei o resultado do meu cabelo.',
      date: '2025-11-22'
    });

    console.log('✅ Dados iniciais inseridos com sucesso!');
    console.log('📊 Resumo:');
    console.log('   - 1 Admin criado');
    console.log('   - 1 Usuário criado');
    console.log('   - 5 Serviços criados');
    console.log('   - 1 Promoção criada');
    console.log('   - 1 Agendamento criado');
    console.log('   - 1 Feedback criado');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    process.exit(1);
  }
};

seedData();
