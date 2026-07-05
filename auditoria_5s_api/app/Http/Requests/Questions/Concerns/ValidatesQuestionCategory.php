<?php

namespace App\Http\Requests\Questions\Concerns;

use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

trait ValidatesQuestionCategory
{
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $category = $this->input('category');

            if (!$category) {
                return;
            }

            $categoryExists = DB::table('generic_table_items')
                ->join('generic_tables', 'generic_tables.id', '=', 'generic_table_items.generic_table_id')
                ->where('generic_tables.code', 'QUESTION_CATEGORY')
                ->where('generic_tables.active', true)
                ->where('generic_table_items.code', $category)
                ->where('generic_table_items.active', true)
                ->exists();

            if (!$categoryExists) {
                $validator->errors()->add('category', 'The selected category is invalid.');
            }
        });
    }
}
