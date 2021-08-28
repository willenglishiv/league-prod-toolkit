import { PluginContext } from 'league-prod-toolkit/core/modules/Module'
import { ValoState } from './controller/ValoState';

const namespace = 'valorant-state';

module.exports = async (ctx: PluginContext) => {
  // Register new UI page
  ctx.LPTE.emit({
    meta: {
      type: 'add-pages',
      namespace: 'ui',
      version: 1
    },
    pages: [{
      name: 'OP Valorant Game State',
      frontend: 'frontend',
      id: 'op-valo-game'
    }]
  });

  const state = new ValoState(ctx)

  // Answer requests to get state
  ctx.LPTE.on(namespace, 'request', e => {
    ctx.LPTE.emit({
      meta: {
        namespace: 'reply',
        type: e.meta.reply as string,
        version: 1
      },
      state: state.getState()
    })
  });

  ctx.LPTE.on('valo', 'valo-pregame-create', e => {
    state.sessionLoopState = e.state
    state.matchInfo.init(e.data)
    state.preGame.init(e.data)
  });
  ctx.LPTE.on('valo', 'valo-pregame-update', e => {
    state.preGame.update(e.data)
  });
  ctx.LPTE.on('valo', 'valo-pregame-delete', e => {
    state.preGame.delete()
  });

  // Emit event that we're ready to operate
  ctx.LPTE.emit({
    meta: {
      type: 'plugin-status-change',
      namespace: 'lpt',
      version: 1
    },
    status: 'RUNNING'
  });
};
