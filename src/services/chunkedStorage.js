
export function createChunkedStorage(driver, newId) {
  let queue = Promise.resolve();
  
  function exclusive(task) {
    const result = queue.then(task);
    queue = result.then(() => undefined, () => undefined);
    return result;
  }
  
  async function readIndex(key) {
    const raw = await driver.getItem(key);
    if (!raw) return null;
    const index = JSON.parse(raw);
    if (index.v !== 1 || !/^[a-zA-Z0-9-]+$/.test(index.id) || !Number.isInteger(index.count) || index.count < 1 || index.count > 1024) {
      throw new Error('Nieprawidłowy zapis bezpiecznej sesji.');
    }
    return  (index);
  }
  
  async function clean(key, index) {
    if (!index) return;
    await Promise.all(Array.from({ length: index.count }, (_, i) => driver.removeItem(`${key}.${index.id}.${i}`)));
  }
  return {
    
    getItem(key) {
      return exclusive(async () => {
        const index = await readIndex(key);
        if (!index) return null;
        const chunks = await Promise.all(Array.from({ length: index.count }, (_, i) => driver.getItem(`${key}.${index.id}.${i}`)));
        if (chunks.some((part) => part === null)) throw new Error('Niekompletny zapis bezpiecznej sesji.');
        return chunks.join('');
      });
    },
    
    setItem(key, value) {
      return exclusive(async () => {
        const old = await readIndex(key);
        const chars = Array.from(value);
        const count = Math.max(1, Math.ceil(chars.length / 500));
        if (count > 1024) throw new Error('Sesja przekracza limit magazynu.');
        const index = { v: 1, id: newId(), count };
        try {
          for (let i = 0; i < count; i += 1) {
            await driver.setItem(`${key}.${index.id}.${i}`, chars.slice(i * 500, (i + 1) * 500).join(''));
          }
          await driver.setItem(key, JSON.stringify(index));
        } catch (error) {
          await clean(key, index).catch(() => {});
          throw error;
        }
        await clean(key, old).catch(() => {});
      });
    },
    
    removeItem(key) {
      return exclusive(async () => {
        const old = await readIndex(key);
        await driver.removeItem(key);
        await clean(key, old);
      });
    },
  };
}
