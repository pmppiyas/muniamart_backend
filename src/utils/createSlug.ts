import prisma from '../config/prisma';
import slugify from 'slugify';

export const generateSlug = async (
  name: string,
  excludeId?: string
): Promise<string> => {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  let slug = base;
  let counter = 0;

  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });

    if (!existing || existing.id === excludeId) break;

    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
};
