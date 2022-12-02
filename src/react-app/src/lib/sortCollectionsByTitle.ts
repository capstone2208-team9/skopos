import {ICollection} from 'types'

export default function sortCollectionsByTitle(collections: Pick<ICollection, 'id'|'title'>[]) {
  return collections.sort((a, b) => a.title < b.title ? -1 : 1)
}