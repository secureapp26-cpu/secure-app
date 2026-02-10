import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ShiftService } from '../shift/shift.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserRepository: jest.Mocked<{
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  }>;
  let mockJwtService: jest.Mocked<{
    signAsync: jest.Mock;
    verify: jest.Mock;
  }>;
  let mockConfigService: jest.Mocked<{
    get: jest.Mock;
  }>;
  let mockShiftService: jest.Mocked<{
    isUserInActiveShift: jest.Mock;
  }>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    mockJwtService = {
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn((key: string): string | number | undefined => {
        const config: Record<string, string | number> = {
          'security.bcryptSaltRounds': 12,
          'jwt.secret': 'test-secret',
          'jwt.expiresIn': '15m',
          'jwt.refreshSecret': 'test-refresh-secret',
          'jwt.refreshExpiresIn': '7d',
        };
        return config[key];
      }),
    };

    mockShiftService = {
      isUserInActiveShift: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ShiftService,
          useValue: mockShiftService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('debe registrar un nuevo usuario exitosamente', async () => {
      // Arrange - Preparar
      const registerDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
        full_name: 'Test User',
        role: UserRole.OPERATOR,
        company_id: 'ABC123',
      };

      const hashedPassword = await bcrypt.hash(registerDto.password, 12);
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: registerDto.email,
        password_hash: hashedPassword,
        full_name: registerDto.full_name,
        role: registerDto.role,
        company_id: registerDto.company_id,
        status: UserStatus.ACTIVE,
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValue('mock-token');

      // Act - Actuar
      const result = await service.register(registerDto);

      // Assert - Afirmar
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(registerDto.email);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      // Arrange
      const registerDto = {
        email: 'existing@example.com',
        password: 'Test123!@#',
        full_name: 'Test User',
        role: UserRole.OPERATOR,
        company_id: 'ABC123',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        email: registerDto.email,
      });

      // Act & Assert
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.register(registerDto)).rejects.toThrow(
        'El email ya está registrado',
      );
    });
  });

  describe('login', () => {
    it('debe autenticar un usuario correctamente', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
        device_id: 'device-123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 12);
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: loginDto.email,
        password_hash: hashedPassword,
        full_name: 'Test User',
        role: UserRole.OPERATOR,
        company_id: 'ABC123',
        status: UserStatus.ACTIVE,
        device_id: null,
        empresa: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Test Company',
        },
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockShiftService.isUserInActiveShift.mockResolvedValue(true);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          device_id: loginDto.device_id,
        }),
      );
    });

    it('debe lanzar UnauthorizedException si las credenciales son inválidas', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
        device_id: 'device-123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
    });

    // TODO: Uncomment when shift validation is enabled in production
    // it('debe lanzar ForbiddenException si el usuario no está en un turno activo', async () => {
    //   // Arrange
    //   const loginDto = {
    //     email: 'test@example.com',
    //     password: 'Test123!@#',
    //     device_id: 'device-123',
    //   };

    //   const hashedPassword = await bcrypt.hash(loginDto.password, 12);
    //   const mockUser = {
    //     id: '123e4567-e89b-12d3-a456-426614174001',
    //     email: loginDto.email,
    //     password_hash: hashedPassword,
    //     status: UserStatus.ACTIVE,
    //     empresa: {},
    //   };

    //   mockUserRepository.findOne.mockResolvedValue(mockUser);
    //   mockShiftService.isUserInActiveShift.mockResolvedValue(false);

    //   // Act & Assert
    //   await expect(service.login(loginDto)).rejects.toThrow(ForbiddenException);
    //   await expect(service.login(loginDto)).rejects.toThrow(
    //     'No puedes iniciar sesión fuera de tu horario de turno asignado',
    //   );
    // });

    it('debe invalidar sesión anterior si hay otro dispositivo logueado', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'Test123!@#',
        device_id: 'device-new',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 12);
      const mockUser = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        email: loginDto.email,
        password_hash: hashedPassword,
        status: UserStatus.ACTIVE,
        device_id: 'device-old',
        empresa: {},
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue({});
      mockJwtService.signAsync.mockResolvedValue('mock-token');
      mockShiftService.isUserInActiveShift.mockResolvedValue(true);

      // Act
      await service.login(loginDto);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          device_id: undefined,
          session_token: undefined,
        }),
      );
    });
  });

  describe('validateUser', () => {
    it('debe validar un usuario con device_id correcto', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const deviceId = 'device-123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        status: UserStatus.ACTIVE,
        device_id: deviceId,
        empresa: {},
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.validateUser(userId, deviceId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
      expect(result.device_id).toBe(deviceId);
    });

    it('debe lanzar UnauthorizedException si el device_id no coincide', async () => {
      // Arrange
      const userId = '123e4567-e89b-12d3-a456-426614174001';
      const deviceId = 'device-wrong';
      const mockUser = {
        id: userId,
        status: UserStatus.ACTIVE,
        device_id: 'device-correct',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(service.validateUser(userId, deviceId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateUser(userId, deviceId)).rejects.toThrow(
        'Sesión iniciada en otro dispositivo',
      );
    });
  });
});
