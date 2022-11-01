exports.processSQL = (sql) => {
    let i = 0;
    return sql
      .replace(/\?/g, () => {
        i++;
        return `$${i}`;
      })
      .replace(
        /\b(date|order_date|ship_date) (=|!=|<|>|<=|>=) (\$\d+)\b/gi,
        `$1 $2 $3::date`
      );
  };