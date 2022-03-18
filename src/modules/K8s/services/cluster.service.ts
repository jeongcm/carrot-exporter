import DB from '@/database';
import { CreateClusterDto } from '@/modules/K8s/dtos/cluster.dto';
import { HttpException } from '@/common/exceptions/HttpException';
import { IClusterAdd as Cluster } from '@/common/interfaces/cluster.interface';
import { isEmpty } from '@/common/utils/util';
import { Platform } from '../../../common/types';

/**
 * @memberof K8s
 */
class ClusterService {
  public clusters = DB.Clusters;

  // RYAN: missing tenancyPk NEX-1420
  /**
   * Get all Clusters
   *
   * @returns Promise<Cluster[]>
   * @author Jaswant
   */
  public async findAllCluster(tenancyPk: number): Promise<Cluster[]> {
    if (!tenancyPk) throw new HttpException(400, `tenancyPk is required in headers.`);
    const allUser: Cluster[] = await this.clusters.findAll({
      where: { tenancyPk, isDeleted: false },
      attributes: { exclude: ['tenancyPk', 'pk'] },
    });
    return allUser;
  }

  /**
   * get a cluster by pk
   *
   * @param {number} id
   * @returns Promise<Cluster[]>
   * @author Jaswant
   */
  public async findClusterById(id: string): Promise<Cluster> {
    if (isEmpty(id)) throw new HttpException(400, 'Not a valid cluster');

    const findCluster: Cluster = await this.clusters.findOne({
      where: { id },
      attributes: { exclude: ['tenancyPk', 'pk'] },
    });
    if (!findCluster) throw new HttpException(409, 'Cluster Not found');
    return findCluster;
  }

  /**
   * create a new cluster.
   * Note:
   * - as of 2022-03-07 there is no business logic and side effects
   *
   * @param  {CreateClusterDto} clusterData
   * @returns Promise<Cluster>
   * @author Jaswant
   */
  public async createCluster(clusterData: CreateClusterDto, tenancyPk: number): Promise<Cluster> {
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
    const createClusterData: Cluster = await this.clusters.create({ ...newCluster, tenancyPk });

    return createClusterData;
  }

  /**
   * Update a cluster
   *
   * @param  {number} clusterPk
   * @param  {CreateClusterDto} clusterData
   * @returns Promise<Cluster>
   * @author Jaswant
   */
  public async updateCluster(clusterId: string, clusterData: CreateClusterDto): Promise<Cluster> {
    if (isEmpty(clusterData)) throw new HttpException(400, 'Cluster Data cannot be blank');
    const findCluster: Cluster = await this.clusters.findOne({
      where: { id: clusterId },
      attributes: { exclude: ['tenancyPk', 'pk'] },
    });
    if (!findCluster) throw new HttpException(409, "Cluster doesn't exist");
    const updatingCluster = {
      ...clusterData,
      platform: <Platform>clusterData.platform,
      updatedAt: new Date(),
    };
    await this.clusters.update({ ...updatingCluster }, { where: { id: clusterId } });
    const updateUser: Cluster = await this.clusters.findOne({
      where: { id: clusterId },
      attributes: { exclude: ['tenancyPk', 'pk'] },
    });
    return updateUser;
  }

  /**
   * Delete a cluster
   *
   * @param  {number} clusterPk
   * @returns Promise<Cluster>
   * @author Jaswant
   */
  public async deleteCluster(clusterId: string): Promise<Cluster> {
    if (isEmpty(clusterId)) throw new HttpException(400, 'Clusterid is required');
    const findCluster: Cluster = await this.clusters.findOne({
      where: { id: clusterId },
      attributes: { exclude: ['tenancyPk', 'pk'] },
    });
    if (!findCluster) throw new HttpException(409, "Cluster doesn't exist");
    await this.clusters.update({ isDeleted: true }, { where: { id: clusterId } });
    return findCluster;
  }
}

export default ClusterService;
