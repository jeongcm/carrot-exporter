import { NextFunction, Response } from 'express';
import AccessGroupService from '@/modules/UserTenancy/services/accessGroup.service';
import { CreateAccessGroupDto } from '@/modules/UserTenancy/dtos/accessGroup.dto';
import { CreateAccessGroupChannelDto } from '@/modules/UserTenancy/dtos/accessGroupChannel.dto';
import { AccessGroup } from '@/common/interfaces/accessGroup.interface';
import { AccessGroupMember } from '@/common/interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@/common/interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@/common/interfaces/accessGroupChannel.interface';
import { RequestWithUser } from '@/common/interfaces/auth.interface';

/**
 * Controller for Access Groups APIs.
 * @memberof UserTenancy
 */
class AccessGroupController {
  public accessGroupService = new AccessGroupService();

  /**
   * getAccessGroup
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroups(req: RequestWithUser, res: Response, next: NextFunction) {
    const tenancyPk = req.headers.tenancyid as string;

    try {
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroup(tenancyPk);
      res.status(200).json({ data: findAllAccessGroupData, message: 'all access groups' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupById(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const findOneUserData: AccessGroup = await this.accessGroupService.findAccessGroupById(accessGroupPk);
      res.status(200).json({ data: findOneUserData, message: 'Access group by group id' });
    } catch (error) {
      next(error);
    }
  };
  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupDetail(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const accessGroupData: AccessGroup = await this.accessGroupService.findAccessGroupByIdDetail(accessGroupPk);
      res.status(200).json({ data: accessGroupData, message: 'Access group Detail by group id' });
    } catch (error) {
      next(error);
    }
  };

  // RYAN: Please use type of funciton declaration instead of public async aaa = async() {} because JSDoc cannot parse it
  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupsByUserId(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const currentUserId = req.user.id;
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroupByUserId(currentUserId);
      res.status(200).json({ data: findAllAccessGroupData, message: 'Access Group By User id' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async createAccessGroup(req: RequestWithUser, res: Response, next: NextFunction) {
    const tenancyPk = req.headers.tenancyid as string;

    try {
      const accessGroupData: CreateAccessGroupDto = req.body;
      const currentUserId = req.user.id;
      const createAccessGroupData: AccessGroup = await this.accessGroupService.createAccessGroup(accessGroupData, currentUserId, tenancyPk);
      res.status(201).json({ data: createAccessGroupData, message: 'Created Access Group' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async updateAccessGroup(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const accessGroupData = req.body;
      const currentUserId = req.user.id;
      const updateAccessGroupData: AccessGroup = await this.accessGroupService.updateAccessGroup(accessGroupPk, accessGroupData, currentUserId);
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Access Group' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async updateAccessGroupMembers(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const membersData = req.body;
      const currentUserId = req.user.id;
      const updateAccessGroupData: AccessGroupMember[] = await this.accessGroupService.updateAccessGroupMembers(
        accessGroupPk,
        membersData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Members' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupMembers(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const currentAcessGroupData: AccessGroupMember[] = await this.accessGroupService.getAccessGroupMembers(accessGroupPk);
      res.status(200).json({ data: currentAcessGroupData, message: 'Members of specfic access group' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async updateAccessGroupChannels(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const channelsData = req.body;
      const currentUserId = req.user.id;
      const updateAccessGroupData: CreateAccessGroupChannelDto[] = await this.accessGroupService.updateAccessGroupChannels(
        accessGroupPk,
        channelsData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Channels' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupChannels(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const currentAcessGroupData: AccessGroupChannel[] = await this.accessGroupService.getAccessGroupChannels(accessGroupPk);
      res.status(200).json({ data: currentAcessGroupData, message: 'Channels of specfic access group' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async updateAccessGroupClusters(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const clustersData = req.body;
      const currentUserId = req.user.id;
      const updateAccessGroupData: AccessGroupCluster[] = await this.accessGroupService.updateAccessGroupClusters(
        accessGroupPk,
        clustersData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Clusters' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @param  {Request} req
   * @param  {Response} res
   * @param  {NextFunction} next
   */
  public async getAccessGroupClusters(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const accessGroupPk = req.params.id;
      const currentAcessGroupData: AccessGroupCluster[] = await this.accessGroupService.getAccessGroupClusters(accessGroupPk);
      res.status(200).json({ data: currentAcessGroupData, message: 'Clusters of specfic access group' });
    } catch (error) {
      next(error);
    }
  };
}

export default AccessGroupController;
