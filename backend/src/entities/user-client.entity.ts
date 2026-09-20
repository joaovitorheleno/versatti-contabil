import { Entity, JoinColumn, ManyToOne } from "typeorm";
import { CrudEntity } from "./abstract/crud-entity";
import { ClientEntity } from "./client.entity";
import { UserEntity } from "./user.entity";

@Entity('user_client')
export class UserClientEntity extends CrudEntity {

    @ManyToOne(() => UserEntity, (user) => user.userClients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @ManyToOne(() => ClientEntity, (client) => client.userClients, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'client_id' })
    client!: ClientEntity;

}