export default {
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        { path: '/', component: './index' },
        { path: '/vuln', component: './vuln/index' },
        { path: '/vuln/:id', component: './vuln/[id]' },
        { path: '/approval', component: './approval/index' },
        { path: '/approval/:id', component: './approval/[id]' },
      ],
    },
  ],
  npmClient: 'npm',
};