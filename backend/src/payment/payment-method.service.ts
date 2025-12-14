import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentMethodService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findAllForAdmin() {
    return this.prisma.paymentMethod.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });

    if (!method) {
      throw new NotFoundException('Mode de paiement non trouvé');
    }

    return method;
  }

  async create(data: {
    name: string;
    logo?: string;
    rib: string;
    qrCode?: string;
    isActive?: boolean;
    order?: number;
  }) {
    // Vérifier si un mode de paiement avec le même nom existe déjà
    const existing = await this.prisma.paymentMethod.findFirst({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('Un mode de paiement avec ce nom existe déjà');
    }

    // Si order n'est pas fourni, utiliser le max + 1
    if (data.order === undefined) {
      const maxOrder = await this.prisma.paymentMethod.aggregate({
        _max: { order: true },
      });
      data.order = (maxOrder._max.order ?? -1) + 1;
    }

    return this.prisma.paymentMethod.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        rib: data.rib,
        qrCode: data.qrCode || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        order: data.order,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      logo?: string;
      rib?: string;
      qrCode?: string;
      isActive?: boolean;
      order?: number;
    },
  ) {
    const method = await this.findOne(id);

    const updateData: any = {};

    if (data.name !== undefined) {
      // Vérifier si un autre mode de paiement avec le même nom existe
      const existing = await this.prisma.paymentMethod.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Un mode de paiement avec ce nom existe déjà');
      }
      updateData.name = data.name;
    }

    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.rib !== undefined) updateData.rib = data.rib;
    if (data.qrCode !== undefined) updateData.qrCode = data.qrCode;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.order !== undefined) updateData.order = data.order;

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.paymentMethod.delete({
      where: { id },
    });
  }
}

