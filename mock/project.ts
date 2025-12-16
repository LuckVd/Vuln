import { Project, ProjectProblemSnapshot, ProjectInheritanceParams, ProjectInheritanceRecord, ApiResponse, PaginatedData } from '../src/types';

// Mock 项目数据
let mockProjects: Project[] = [
  {
    id: 1,
    projectNumber: 'PRJ-001',
    planningVersion: 'v1.0.0',
    manager: '张经理',
    status: 2, // 处置中
    createTime: '2024-01-01 09:00:00',
    completionTime: undefined
  },
  {
    id: 2,
    projectNumber: 'PRJ-002',
    planningVersion: 'v2.1.0',
    manager: '李主管',
    status: 2, // 处置中
    createTime: '2024-01-05 14:30:00',
    completionTime: undefined
  },
  {
    id: 3,
    projectNumber: 'PRJ-003',
    planningVersion: 'v3.0.0',
    manager: '王总监',
    status: 1, // 已创建
    createTime: '2024-01-10 10:15:00',
    completionTime: undefined
  },
  {
    id: 4,
    projectNumber: 'PRJ-004',
    planningVersion: 'v1.5.0',
    manager: '陈经理',
    status: 4,
    createTime: '2023-12-15 16:45:00',
    completionTime: '2024-01-12 11:20:00'
  },
  {
    id: 5,
    projectNumber: 'PRJ-005',
    planningVersion: 'v2.5.0',
    manager: '赵主管',
    status: 3, // 审批中
    createTime: '2024-01-18 13:20:00',
    completionTime: undefined
  }
];

// Mock 项目问题单快照数据
let mockProjectSnapshots: ProjectProblemSnapshot[] = [
  {
    id: 1,
    projectNumber: 'PRJ-001',
    tr6Number: 'TR6-2024-001',
    createTime: '2024-01-15 15:30:00',
    snapshotContent: {
      totalProblems: 3,
      severeProblems: 1,
      highProblems: 1,
      mediumProblems: 1,
      lowProblems: 0,
      problemNumbers: ['PROB-2024-001', 'PROB-2024-002', 'PROB-2024-008'],
      snapshotTime: '2024-01-15 15:30:00'
    }
  },
  {
    id: 2,
    projectNumber: 'PRJ-002',
    tr6Number: 'TR6-2024-002',
    createTime: '2024-01-16 10:15:00',
    snapshotContent: {
      totalProblems: 2,
      severeProblems: 0,
      highProblems: 0,
      mediumProblems: 1,
      lowProblems: 1,
      problemNumbers: ['PROB-2024-003', 'PROB-2024-004'],
      snapshotTime: '2024-01-16 10:15:00'
    }
  },
  {
    id: 3,
    projectNumber: 'PRJ-003',
    tr6Number: 'TR6-2024-003',
    createTime: '2024-01-17 14:20:00',
    snapshotContent: {
      totalProblems: 4,
      severeProblems: 1,
      highProblems: 1,
      mediumProblems: 1,
      lowProblems: 1,
      problemNumbers: ['PROB-2024-005', 'PROB-2024-006', 'PROB-2024-009', 'PROB-2024-010'],
      snapshotTime: '2024-01-17 14:20:00'
    }
  }
];

// 用于生成新的项目ID
let nextProjectId = 6;
let nextSnapshotId = 4;
let nextInheritanceRecordId = 1;

// Mock 项目继承记录数据
let mockInheritanceRecords: ProjectInheritanceRecord[] = [];

// 生成项目编号
function generateProjectNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const sequence = String(mockProjects.length + 1).padStart(3, '0');
  return `PRJ-${year}-${sequence}`;
}

export default {
  // 获取项目列表
  'GET /api/project': (req: any, res: any) => {

    const { current = 1, pageSize = 10, status, manager } = req.query;

    let filteredProjects = [...mockProjects];

    // 按状态过滤
    if (status) {
      filteredProjects = filteredProjects.filter(p => p.status === status);
    }

    // 按项目经理过滤
    if (manager) {
      filteredProjects = filteredProjects.filter(p => p.manager === manager);
    }

    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredProjects.slice(startIndex, endIndex);

    res.json({
      code: 200,
      message: '获取项目列表成功',
      data: paginatedData,
      total: filteredProjects.length
    });
  },

  // 获取项目详情
  'GET /api/project/:id': (req: any, res: any) => {
    const { id } = req.params;

    const project = mockProjects.find(p => p.id === parseInt(id));

    if (!project) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取项目详情成功',
      data: project
    });
  },

  // 创建项目
  'POST /api/project': (req: any, res: any) => {
    const {
      planningVersion,
      manager,
      status = 1
    } = req.body;

    const newProject: Project = {
      id: nextProjectId++,
      projectNumber: generateProjectNumber(),
      planningVersion,
      manager,
      status,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      completionTime: undefined
    };

    mockProjects.push(newProject);

    res.json({
      code: 200,
      message: '创建项目成功',
      data: newProject
    });
  },

  // 更新项目
  'PUT /api/project/:id': (req: any, res: any) => {
    const { id } = req.params;
    const updateData = req.body;

    const index = mockProjects.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    mockProjects[index] = { ...mockProjects[index], ...updateData };

    res.json({
      code: 200,
      message: '更新项目成功',
      data: mockProjects[index]
    });
  },

  // 删除项目
  'DELETE /api/project/:id': (req: any, res: any) => {
    const { id } = req.params;

    const index = mockProjects.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    const deletedProject = mockProjects.splice(index, 1)[0];

    res.json({
      code: 200,
      message: '删除项目成功',
      data: deletedProject
    });
  },

  // 项目结项
  'POST /api/project/:id/complete': (req: any, res: any) => {
    const { id } = req.params;

    const index = mockProjects.findIndex(p => p.id === parseInt(id));

    if (index === -1) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    mockProjects[index].status = 4; // 关闭
    mockProjects[index].completionTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    res.json({
      code: 200,
      message: '项目结项成功',
      data: mockProjects[index]
    });
  },

  // 获取项目统计信息
  'GET /api/project/statistics': (req: any, res: any) => {

    const statistics = {
      totalProjects: mockProjects.length,
      activeProjects: mockProjects.filter(p => p.status === 2 || p.status === 3).length,
      completedProjects: mockProjects.filter(p => p.status === 4).length,
      createdProjects: mockProjects.filter(p => p.status === 1).length,
      projectsByStatus: {
        created: mockProjects.filter(p => p.status === 1).length,
        processing: mockProjects.filter(p => p.status === 2).length,
        approving: mockProjects.filter(p => p.status === 3).length,
        closed: mockProjects.filter(p => p.status === 4).length
      }
    };

    res.json({
      code: 200,
      message: '获取项目统计信息成功',
      data: statistics
    });
  },

  // 获取项目问题单快照列表
  'GET /api/project/:id/snapshots': (req: any, res: any) => {
    const { id } = req.params;

    const project = mockProjects.find(p => p.id === parseInt(id));

    if (!project) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    const snapshots = mockProjectSnapshots.filter(s => s.projectNumber === project.projectNumber);

    res.json({
      code: 200,
      message: '获取项目快照列表成功',
      data: snapshots,
      total: snapshots.length
    });
  },

  // 创建项目问题单快照
  'POST /api/project/:id/snapshot': (req: any, res: any) => {
    const { id } = req.params;
    const { tr6Number, snapshotContent } = req.body;

    const project = mockProjects.find(p => p.id === parseInt(id));

    if (!project) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    const newSnapshot: ProjectProblemSnapshot = {
      id: nextSnapshotId++,
      projectNumber: project.projectNumber,
      tr6Number,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      snapshotContent
    };

    mockProjectSnapshots.push(newSnapshot);

    res.json({
      code: 200,
      message: '创建项目快照成功',
      data: newSnapshot
    });
  },

  // 删除项目问题单快照
  'DELETE /api/project/snapshot/:snapshotId': (req: any, res: any) => {
    const { snapshotId } = req.params;

    const index = mockProjectSnapshots.findIndex(s => s.id === parseInt(snapshotId));

    if (index === -1) {
      return res.json({
        code: 404,
        message: '项目快照不存在'
      });
    }

    const deletedSnapshot = mockProjectSnapshots.splice(index, 1)[0];

    res.json({
      code: 200,
      message: '删除项目快照成功',
      data: deletedSnapshot
    });
  },

  // 批量分配项目经理
  'POST /api/project/batch-assign': (req: any, res: any) => {
    const { projectIds, manager } = req.body;

    let successCount = 0;
    const failedIds: number[] = [];

    projectIds.forEach((id: number) => {
      const index = mockProjects.findIndex(p => p.id === id);
      if (index !== -1) {
        mockProjects[index].manager = manager;
        successCount++;
      } else {
        failedIds.push(id);
      }
    });

    res.json({
      code: 200,
      message: '批量分配完成',
      data: {
        successCount,
        failedCount: failedIds.length,
        failedIds
      }
    });
  },

  // 获取可继承的项目列表（排除当前项目及其子项目）
  'GET /api/project/inheritable/:projectId': (req: any, res: any) => {
    const { projectId } = req.params;
    const currentProject = mockProjects.find(p => p.id === parseInt(projectId));

    if (!currentProject) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    // 递归获取所有子项目编号
    function getAllChildProjects(projectNumber: string): Set<string> {
      const childProjects = mockProjects.filter(p => p.parentProjectNumber === projectNumber);
      const allChildren = new Set<string>();

      childProjects.forEach(child => {
        allChildren.add(child.projectNumber);
        const grandChildren = getAllChildProjects(child.projectNumber);
        grandChildren.forEach(gc => allChildren.add(gc));
      });

      return allChildren;
    }

    const childProjectNumbers = getAllChildProjects(currentProject.projectNumber);

    // 过滤出可继承的项目：排除自己、子项目、以及已存在的父项目
    const inheritableProjects = mockProjects.filter(p =>
      p.projectNumber !== currentProject.projectNumber &&
      !childProjectNumbers.has(p.projectNumber) &&
      p.projectNumber !== currentProject.parentProjectNumber
    );

    res.json({
      code: 200,
      message: '获取可继承项目列表成功',
      data: inheritableProjects
    });
  },

  // 创建项目继承关系
  'POST /api/project/:id/inherit': (req: any, res: any) => {
    const { id } = req.params;
    const inheritanceParams: ProjectInheritanceParams = req.body;

    const project = mockProjects.find(p => p.id === parseInt(id));
    const parentProject = mockProjects.find(p => p.projectNumber === inheritanceParams.parentProjectNumber);

    if (!project) {
      return res.json({
        code: 404,
        message: '目标项目不存在'
      });
    }

    if (!parentProject) {
      return res.json({
        code: 404,
        message: '父项目不存在'
      });
    }

    // 检查是否会形成循环继承
    function checkCircularInheritance(parentProjectNumber: string, targetProjectNumber: string): boolean {
      if (parentProjectNumber === targetProjectNumber) return true;

      const parentProject = mockProjects.find(p => p.projectNumber === parentProjectNumber);
      if (!parentProject || !parentProject.parentProjectNumber) return false;

      return checkCircularInheritance(parentProject.parentProjectNumber, targetProjectNumber);
    }

    if (checkCircularInheritance(inheritanceParams.parentProjectNumber, project.projectNumber)) {
      return res.json({
        code: 400,
        message: '不能形成循环继承关系'
      });
    }

    // 创建继承记录
    const inheritanceRecord: ProjectInheritanceRecord = {
      id: nextInheritanceRecordId++,
      fromProjectNumber: inheritanceParams.parentProjectNumber,
      toProjectNumber: project.projectNumber,
      inheritanceType: inheritanceParams.inheritanceType,
      inheritedItems: {
        problems: inheritanceParams.copyProblems ? 5 : 0, // Mock数据
        attachments: inheritanceParams.copyAttachments ? 3 : 0,
        snapshots: inheritanceParams.copySnapshots ? 2 : 0
      },
      status: 'pending',
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    // 更新项目继承信息
    project.parentProjectNumber = inheritanceParams.parentProjectNumber;
    project.inheritanceType = inheritanceParams.inheritanceType;
    project.inheritanceStatus = 'pending';
    project.inheritedFromProject = inheritanceParams.parentProjectNumber;
    project.inheritedAt = inheritanceRecord.createTime;

    mockInheritanceRecords.push(inheritanceRecord);

    // 模拟异步继承操作（实际应该是后台任务）
    setTimeout(() => {
      const recordIndex = mockInheritanceRecords.findIndex(r => r.id === inheritanceRecord.id);
      if (recordIndex !== -1) {
        mockInheritanceRecords[recordIndex].status = 'completed';
        mockInheritanceRecords[recordIndex].completeTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const projectIndex = mockProjects.findIndex(p => p.id === parseInt(id));
        if (projectIndex !== -1) {
          mockProjects[projectIndex].inheritanceStatus = 'completed';
        }
      }
    }, 3000);

    res.json({
      code: 200,
      message: '项目继承关系创建成功，正在执行继承操作',
      data: {
        inheritanceRecord,
        project
      }
    });
  },

  // 获取项目继承关系
  'GET /api/project/:id/inheritance': (req: any, res: any) => {
    const { id } = req.params;
    const project = mockProjects.find(p => p.id === parseInt(id));

    if (!project) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    // 获取父项目信息
    let parentProject = null;
    if (project.parentProjectNumber) {
      parentProject = mockProjects.find(p => p.projectNumber === project.parentProjectNumber);
    }

    // 获取子项目信息
    const childProjects = mockProjects.filter(p => p.parentProjectNumber === project.projectNumber);

    // 获取继承记录
    const inheritanceRecords = mockInheritanceRecords.filter(r =>
      r.fromProjectNumber === project.projectNumber || r.toProjectNumber === project.projectNumber
    );

    res.json({
      code: 200,
      message: '获取项目继承关系成功',
      data: {
        project,
        parentProject,
        childProjects,
        inheritanceRecords
      }
    });
  },

  // 获取项目继承记录列表
  'GET /api/project/inheritance-records': (req: any, res: any) => {
    const { current = 1, pageSize = 10, projectNumber, status } = req.query;

    let filteredRecords = [...mockInheritanceRecords];

    // 按项目编号过滤
    if (projectNumber) {
      filteredRecords = filteredRecords.filter(r =>
        r.fromProjectNumber === projectNumber || r.toProjectNumber === projectNumber
      );
    }

    // 按状态过滤
    if (status) {
      filteredRecords = filteredRecords.filter(r => r.status === status);
    }

    // 按创建时间倒序排列
    filteredRecords.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

    // 分页
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredRecords.slice(startIndex, endIndex);

    res.json({
      code: 200,
      message: '获取项目继承记录列表成功',
      data: paginatedData,
      total: filteredRecords.length
    });
  },

  // 取消项目继承关系
  'DELETE /api/project/:id/inheritance': (req: any, res: any) => {
    const { id } = req.params;
    const project = mockProjects.find(p => p.id === parseInt(id));

    if (!project) {
      return res.json({
        code: 404,
        message: '项目不存在'
      });
    }

    if (!project.parentProjectNumber) {
      return res.json({
        code: 400,
        message: '项目没有继承关系可以取消'
      });
    }

    // 检查是否有子项目
    const hasChildren = mockProjects.some(p => p.parentProjectNumber === project.projectNumber);
    if (hasChildren) {
      return res.json({
        code: 400,
        message: '项目存在子项目，无法取消继承关系'
      });
    }

    const parentProjectNumber = project.parentProjectNumber;

    // 清除继承关系
    project.parentProjectNumber = undefined;
    project.inheritanceType = 'none';
    project.inheritanceStatus = undefined;
    project.inheritedFromProject = undefined;
    project.inheritedAt = undefined;

    res.json({
      code: 200,
      message: '取消项目继承关系成功',
      data: {
        project,
        cancelledFrom: parentProjectNumber
      }
    });
  }
};