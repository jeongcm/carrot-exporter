import { NextFunction, Request, Response } from 'express';
import { currentUser } from '@/utils/currentUser';

import AccessGroupService from '@services/accessGroup.service';

import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';
import { CreateAccessGroupChannelDto } from '@dtos/accessGroupChannel.dto';

import { AccessGroup } from '@interfaces/accessGroup.interface';
import { AccessGroupMember } from '@/interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@/interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@/interfaces/accessGroupChannel.interface';

class AccessGroupController {
  public accessGroupService = new AccessGroupService();

  public getAccessGroups = async (req: Request, res: Response, next: NextFunction) => {
    const tenancyId = req.headers.tenancyid as string;

    try {
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroup(tenancyId);
      res.status(200).json({ data: findAllAccessGroupData, message: 'all access groups' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const findOneUserData: AccessGroup = await this.accessGroupService.findAccessGroupById(accessGroupId);
      res.status(200).json({ data: findOneUserData, message: 'Access group by group id' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let currentUserId = currentUser(req).id;
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroupByUserId(currentUserId);
      res.status(200).json({ data: findAllAccessGroupData, message: 'Access Group By User id' });
    } catch (error) {
      next(error);
    }
  };

  public createAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    const tenancyId = req.headers.tenancyid as string;

    try {
      const accessGroupData: CreateAccessGroupDto = req.body;
      let currentUserId = currentUser(req).id;
      const createAccessGroupData: AccessGroup = await this.accessGroupService.createAccessGroup(accessGroupData, currentUserId, tenancyId);
      res.status(201).json({ data: createAccessGroupData, message: 'Created Access Group' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const accessGroupData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: AccessGroup = await this.accessGroupService.updateAccessGroup(accessGroupId, accessGroupData, currentUserId);
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Access Group' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const membersData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: AccessGroupMember[] = await this.accessGroupService.updateAccessGroupMembers(
        accessGroupId,
        membersData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Members' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const currentAcessGroupData: AccessGroupMember[] = await this.accessGroupService.getAccessGroupMembers(accessGroupId);
      res.status(200).json({ data: currentAcessGroupData, message: 'Members of specfic access group' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroupChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const channelsData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: CreateAccessGroupChannelDto[] = await this.accessGroupService.updateAccessGroupChannels(
        accessGroupId,
        channelsData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Channels' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const currentAcessGroupData: AccessGroupChannel[] = await this.accessGroupService.getAccessGroupChannels(accessGroupId);
      res.status(200).json({ data: currentAcessGroupData, message: 'Channels of specfic access group' });
    } catch (error) {
      next(error);
    }
  };

  public updateAccessGroupClusters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const clustersData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: AccessGroupCluster[] = await this.accessGroupService.updateAccessGroupClusters(
        accessGroupId,
        clustersData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Clusters' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupClusters = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const currentAcessGroupData: AccessGroupCluster[] = await this.accessGroupService.getAccessGroupClusters(accessGroupId);
      res.status(200).json({ data: currentAcessGroupData, message: 'Clusters of specfic access group' });
    } catch (error) {
      next(error);
    }
  };
}

export default AccessGroupController;
