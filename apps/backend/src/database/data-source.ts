import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { User } from '../modules/users/entities/user.entity';
import { Will } from '../modules/wills/entities/will.entity';
import { Beneficiary } from '../modules/wills/entities/beneficiary.entity';
import { Asset } from '../modules/wills/entities/asset.entity';
import { AssetAllocation } from '../modules/wills/entities/asset-allocation.entity';
import { Executor } from '../modules/wills/entities/executor.entity';
import { Guardian } from '../modules/wills/entities/guardian.entity';
import { Witness } from '../modules/wills/entities/witness.entity';
import { ChatMessage } from '../modules/wills/entities/chat-message.entity';
import { WillSnapshot } from '../modules/wills/entities/will-snapshot.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_dev_password',
  database: process.env.DB_NAME || 'lawyered',
  entities: [
    User,
    Will,
    Beneficiary,
    Asset,
    AssetAllocation,
    Executor,
    Guardian,
    Witness,
    ChatMessage,
    WillSnapshot,
  ],
  migrations: [join(__dirname, '../migrations/*.{js,ts}')],
  synchronize: false,
});
