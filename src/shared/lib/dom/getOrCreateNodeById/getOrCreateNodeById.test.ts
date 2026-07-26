import { getOrCreateNodeById } from './getOrCreateNodeById';

describe('getOrCreateNodeById', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('should return existing node by id', () => {
    const node = document.createElement('div');
    node.setAttribute('id', 'modal-root');
    document.body.appendChild(node);

    const result = getOrCreateNodeById('modal-root');
    expect(result).toBe(node);
  });

  it('should create node if it does not exist', () => {
    const result = getOrCreateNodeById('modal-root');
    expect(result.id).toBe('modal-root');
    expect(document.getElementById('modal-root')).toBe(result);
  });

  it('should append created node to body', () => {
    const result = getOrCreateNodeById('notification-root');
    expect(document.body.contains(result)).toBe(true);
  });

  it('should not create duplicate nodes', () => {
    const firstResult = getOrCreateNodeById('portal-root');
    const secondResult = getOrCreateNodeById('portal-root');
    expect(secondResult).toBe(firstResult);
    expect(document.querySelectorAll('#portal-root')).toHaveLength(1);
  });
});
