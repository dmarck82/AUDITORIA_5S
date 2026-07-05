<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\People\StorePersonRequest;
use App\Http\Requests\People\UpdatePersonRequest;
use App\Http\Resources\PersonListResource;
use App\Http\Resources\PersonResource;
use App\Models\Person;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class PersonController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PersonListResource::collection(
            Person::query()
                ->with([
                    'organization:id,name,active',
                    'unit:id,organization_id,name,active',
                    'sector:id,unit_id,name,active',
                    'updatedBy.person',
                ])
                ->latest()
                ->paginate()
        );
    }

    public function store(StorePersonRequest $request): PersonResource
    {
        $data = $request->validated();
        unset($data['photo']);

        if ($request->hasFile('photo')) {
            $data['photo_path'] = $request->file('photo')->store('people/photos');
        }

        $person = Person::create($data);

        return new PersonResource($person->load(['organization', 'unit', 'sector', 'user', 'updatedBy.person']));
    }

    public function show(Person $person): PersonResource
    {
        return new PersonResource($person->load(['organization', 'unit', 'sector', 'user', 'updatedBy.person']));
    }

    public function update(UpdatePersonRequest $request, Person $person): PersonResource
    {
        $data = $request->validated();
        unset($data['photo']);

        if ($request->hasFile('photo')) {
            if ($person->photo_path) {
                Storage::disk('local')->delete($person->photo_path);
            }

            $data['photo_path'] = $request->file('photo')->store('people/photos');
        }

        $person->update($data);

        return new PersonResource($person->load(['organization', 'unit', 'sector', 'user', 'updatedBy.person']));
    }

    public function destroy(Person $person): Response
    {
        if ($person->photo_path) {
            Storage::disk('local')->delete($person->photo_path);
        }

        $person->delete();

        return response()->noContent();
    }

    public function photo(Person $person): BinaryFileResponse
    {
        abort_unless($person->photo_path && Storage::disk('local')->exists($person->photo_path), 404);

        return response()->file(Storage::disk('local')->path($person->photo_path));
    }
}
