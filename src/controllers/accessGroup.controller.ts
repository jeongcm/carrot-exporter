import { NextFunction, Request, Response } from 'express';
import { currentUser } from '@/utils/currentUser';

import AccessGroupService from '@services/accessGroup.service';

import { CreateAccessGroupDto } from '@dtos/accessGroup.dto';

import { AccessGroup } from '@interfaces/accessGroup.interface';
import { AccessGroupMember } from '@/interfaces/accessGroupMember.interface';
import { AccessGroupCluster } from '@/interfaces/accessGroupCluster.interface';
import { AccessGroupChannel } from '@/interfaces/accessGroupChannel.interface';

class AccessGroupController {
  public accessGroupService = new AccessGroupService();

  public getAccessGroups = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroup();
      res.status(200).json({ data: findAllAccessGroupData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const findOneUserData: AccessGroup = await this.accessGroupService.findAccessGroupById(accessGroupId);
      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  public getAccessGroupsByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let currentUserId = currentUser(req).id;
      const findAllAccessGroupData: AccessGroup[] = await this.accessGroupService.findAllAccessGroupByUserId(currentUserId);
      res.status(200).json({ data: findAllAccessGroupData, message: 'findAllById' });
    } catch (error) {
      next(error);
    }
  };

  public createAccessGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupData: CreateAccessGroupDto = req.body;
      let currentUserId = currentUser(req).id;
      const createAccessGroupData: AccessGroup = await this.accessGroupService.createAccessGroup(accessGroupData, currentUserId);
      res.status(201).json({ data: createAccessGroupData, message: 'created' });
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
      res.status(200).json({ data: updateAccessGroupData, message: 'updated' });
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

  public updateAccessGroupChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessGroupId = req.params.id;
      const channelsData = req.body;
      let currentUserId = currentUser(req).id;
      const updateAccessGroupData: AccessGroupChannel[] = await this.accessGroupService.updateAccessGroupChannels(
        accessGroupId,
        channelsData,
        currentUserId,
      );
      res.status(200).json({ data: updateAccessGroupData, message: 'updated Channels' });
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
}

export default AccessGroupController;
