/**
 * Returns an existing DOM node by id or creates a new div with this id
 *
 * * Useful for portal roots, for example modals or notifications
 */
const getOrCreateNodeById = (elementId: string): HTMLElement => {
  const existingRoot = document.getElementById(elementId);
  if (existingRoot) {
    return existingRoot;
  }
  const root = document.createElement('div');
  root.setAttribute('id', elementId);
  document.body.appendChild(root);

  return root;
};

export { getOrCreateNodeById };
