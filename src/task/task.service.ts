import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma.service';
import { UserInterface } from 'src/auth/interfaces/user.interface';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createTaskDto: CreateTaskDto) {
    try {
      const task = await this.prisma.task.create({
        data: {
          ...createTaskDto,
        },
      });
      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async findAll() {
    try {
      const tasks = await this.prisma.task.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          assignee: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      return tasks;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          dueDate: true,
          assignee: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async assignTo(id: string, staffId: string) {
    try {
      const staff = await this.prisma.user.findUnique({
        where: {
          id: staffId,
        },
      });
      if (!staff) {
        throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
      }
      const task = await this.prisma.task.update({
        where: { id: id },
        data: {
          status: 'in-progress',
          assignee: {
            connect: { id: staff.id },
          },
        },
      });
      return { message: `Task assign to ${staff.name} successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async complete(id: string, user: UserInterface) {
    try {
      const task = await this.prisma.task.findUnique({
        where: {
          id: id,
        },
      });
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      if (task.assigneeId !== user.id && user.role !== 'admin') {
        throw new UnauthorizedException();
      }
      await this.prisma.task.update({
        where: { id: id },
        data: {
          status: 'complete',
        },
      });
      return { message: `Task  completed to  successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.prisma.task.update({
        where: { id: id },
        data: {
          ...updateTaskDto,
        },
      });
      return task;
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const deletedTask = await this.prisma.task.delete({
        where: { id: id },
      });
      if (!deletedTask) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return { message: `${deletedTask.title} task  deleted successfully` };
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw error;
    }
  }
}
