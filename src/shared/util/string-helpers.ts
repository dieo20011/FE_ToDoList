export function removeAccentedChars(str: string): string {
    // remove accented characters
    const from = 'àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ',
      to = 'aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy';
    for (let i = 0, l = from.length; i < l; i++) {
      str = str.replace(RegExp(from[i], 'gi'), to[i]);
    }
    str = str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    return str;
  }