import DB from '@/database';
import { CreateClusterDto } from '@/modules/K8s/dtos/cluster.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { IClusterAdd as Cluster } from '@/common/interfaces/cluster.interface';
import { isEmpty } from '@/common/utils/util';
import { Platform } from '../../../types';

class ClusterService {
  public clusters = DB.Clusters;

  public async findAllCluster(): Promise<Cluster[]> {
    const allUser: Cluster[] = await this.clusters.findAll({ where: { isDeleted: false } });
    return allUser;
  }

  public async findClusterById(id: number): Promise<Cluster> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid cluster');

    const findCluster: Cluster = await this.clusters.findByPk(id);
    if (!findCluster) throw new HttpException(409, 'Cluster Not found');

    return findCluster;
  }

  public async createCluster(clusterData: CreateClusterDto): Promise<Cluster> {
    if (isEmpty(clusterData)) throw new HttpException(400, 'Cluster Data cannot be blank');
    const currentDate = new Date();
    const newCluster = {
      description: clusterData.description,
      name: clusterData.name,
      icon: clusterData.icon,
      updatedAt: currentDate,
      createdAt: currentDate,
      isDeleted: false,
      platform: <Platform>clusterData.platform,
    };
    const createClusterData: Cluster = await this.clusters.create(newCluster);
    return createClusterData;
  }

  public async updateCluster(clusterId: number, clusterData: CreateClusterDto): Promise<Cluster> {
    if (isEmpty(clusterData)) throw new HttpException(400, 'Cluster Data cannot be blank');
    const findCluster: Cluster = await this.clusters.findByPk(clusterId);
    if (!findCluster) throw new HttpException(409, "Cluster doesn't exist");
    const updatingCluster = {
      ...clusterData,
      platform: <Platform>clusterData.platform,
      updatedAt: new Date(),
    };
    await this.clusters.update({ ...updatingCluster }, { where: { id: clusterId } });
    const updateUser: Cluster = await this.clusters.findByPk(clusterId);
    return updateUser;
  }

  public async deleteCluster(clusterId: number): Promise<Cluster> {
    if (isEmpty(clusterId)) throw new HttpException(400, 'Clusterid is required');
    const findCluster: Cluster = await this.clusters.findByPk(clusterId);
    if (!findCluster) throw new HttpException(409, "Cluster doesn't exist");
    await this.clusters.update({ isDeleted: true }, { where: { id: clusterId } });
    return findCluster;
  }
}

export default ClusterService;
