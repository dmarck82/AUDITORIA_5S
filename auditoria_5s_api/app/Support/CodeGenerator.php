<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;

class CodeGenerator
{
    public static function next(string $table, string $prefix, ?callable $scope = null): string
    {
        $query = DB::table($table);

        if ($scope) {
            $scope($query);
        }

        $codes = $query
            ->where('code', 'like', "{$prefix}-%")
            ->pluck('code');
        $next = 1;
        $pattern = '/^'.preg_quote($prefix, '/').'-(\d+)$/';

        foreach ($codes as $code) {
            if (preg_match($pattern, (string) $code, $matches)) {
                $next = max($next, ((int) $matches[1]) + 1);
            }
        }

        do {
            $code = sprintf('%s-%03d', $prefix, $next++);
            $existsQuery = DB::table($table)->where('code', $code);

            if ($scope) {
                $scope($existsQuery);
            }
        } while ($existsQuery->exists());

        return $code;
    }
}
