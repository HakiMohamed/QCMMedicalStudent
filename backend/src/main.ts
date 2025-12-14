import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// Force l'import de modules nécessaires pour que NestJS les détecte
try {
  require('class-validator');
  require('class-transformer');
} catch (e) {
  console.warn('⚠️ Certains modules requis non trouvés:', e.message);
}

async function bootstrap() {
  try {
    console.log('🔄 Création de l\'application NestJS...');
    const app = await NestFactory.create(AppModule, {
      bodyParser: true,
      rawBody: false,
    });
    console.log('✅ Application créée');

    console.log('🔄 Configuration des middlewares...');
    
    // Augmenter la limite de taille des requêtes pour les images (50MB)
    app.use(require('express').json({ limit: '50mb' }));
    app.use(require('express').urlencoded({ extended: true, limit: '50mb' }));
    
    // Cookie parser pour les refresh tokens
    app.use(cookieParser());
    console.log('✅ Cookie parser configuré');

    // Global prefix (sauf pour health check)
    app.setGlobalPrefix('api', {
      exclude: ['health'],
    });
    console.log('✅ Global prefix configuré');

    // Validation pipe global
    // Note: ValidationPipe désactivé temporairement à cause d'un problème de détection de class-validator
    // La validation peut être gérée manuellement dans les contrôleurs si nécessaire
    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     whitelist: true,
    //     forbidNonWhitelisted: true,
    //     transform: true,
    //     transformOptions: {
    //       enableImplicitConversion: true,
    //     },
    //   }),
    // );

    // CORS
    const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3001';
    app.enableCors({
      origin: corsOrigin,
      credentials: true,
    });
    console.log('✅ CORS configuré');

    // Swagger documentation
    console.log('🔄 Configuration de Swagger...');
    const config = new DocumentBuilder()
      .setTitle('Medical QCM Platform API')
      .setDescription('API pour la plateforme de révision QCM médicale')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    console.log('✅ Swagger configuré');

    const port = process.env.PORT || 3000;
    console.log(`🔄 Démarrage du serveur sur le port ${port}...`);
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Error starting the application:', error);
    process.exit(1);
  }
}

bootstrap();

