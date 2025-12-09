import { Project, ProjectProblemSnapshot, ApiResponse, PaginatedData } from '../src/types';

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
  }
};