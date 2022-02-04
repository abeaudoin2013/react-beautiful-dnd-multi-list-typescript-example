import * as React from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DroppableProvided,
  DraggableLocation,
  DropResult,
  DroppableStateSnapshot, DraggableProvided, DraggableStateSnapshot
} from 'react-beautiful-dnd';
import {Flex} from 'grid-styled'
import './App.css';

interface IItem {
  id: string;
  content: string;
}
interface IAppState {
  items: IItem[];
  selected: IItem[];
}
interface IMoveResult {
  droppable: IItem[];
  droppable2: IItem[];
}

const getItems = (count: number, offset:number = 0): IItem[] => {
  return Array
    .from({length: count}, (v, k) => k)
    .map(k => ({
      content: `item ${k + offset}`,
      id: `item-${k + offset}`
    }));
};

const reorder = (list: IItem[], startIndex: number, endIndex: number):IItem[] => {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


/**
 * Moves an item from one list to another list.
 */
const move = (source: IItem[], destination: IItem[], droppableSource:DraggableLocation, droppableDestination:DraggableLocation):IMoveResult | any => {
  const sourceClone = [...source];
  const destClone = [...destination];
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid:number = 8;

const getItemStyle = (draggableStyle: any, isDragging: boolean):{} => ({
  userSelect: 'none',
  padding: 2*grid,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? 'lightgreen' : 'grey',
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean):{} => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 300,
  minHeight: 400
});

export default class App extends React.Component<{}, IAppState> {

  public id2List = {
    droppable: 'items',
    droppable2: 'selected'
  };

  constructor(props:any) {
    super(props);

    this.state = {
      items: getItems(10, 0),
      selected: getItems(5, 10)
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
  }

  public getList (id:string):IItem[] {
    return this.state[this.id2List[id]];
  }

  public onDragEnd(result: DropResult):void {

    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        this.getList(source.droppableId),
        source.index,
        destination.index
      );

      let state:IAppState = {...this.state};

      if (source.droppableId === "droppable2") {
        state = { ...this.state, selected: items };
      } else if (source.droppableId === "droppable") {
        state = {...this.state, items}
      }

      this.setState(state);

    } else {
      const resultFromMove:IMoveResult = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        items: resultFromMove.droppable,
        selected: resultFromMove.droppable2
      });
    }
  }

  public render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Flex justifyContent={"space-between"}>
          <Flex flexDirection="column">
            <Droppable droppableId="droppable">
              {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(providedDraggable:DraggableProvided, snapshotDraggable:DraggableStateSnapshot) => (
                          <div>
                            <div
                              ref={providedDraggable.innerRef}
                              {...providedDraggable.draggableProps}
                              {...providedDraggable.dragHandleProps}
                              style={getItemStyle(
                                providedDraggable.draggableProps.style,
                                snapshotDraggable.isDragging
                              )}
                            >
                              {item.content}
                            </div>
                            {providedDraggable.placeholder}
                          </div>
                        )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Flex>
          <Droppable droppableId="droppable2">
            {(providedDroppable2:DroppableProvided, snapshotDroppable2:DroppableStateSnapshot) => (
              <div
                ref={providedDroppable2.innerRef}
                style={getListStyle(snapshotDroppable2.isDraggingOver)}>
                {this.state.selected.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id}
                    index={index}>
                    {(providedDraggable2:DraggableProvided, snapshotDraggable2:DraggableStateSnapshot) => (
                      <div>
                        <div
                          ref={providedDraggable2.innerRef}
                          {...providedDraggable2.draggableProps}
                          {...providedDraggable2.dragHandleProps}
                          style={getItemStyle(
                            providedDraggable2.draggableProps.style,
                            snapshotDraggable2.isDragging
                          )}>
                          {item.content}
                        </div>
                        {providedDraggable2.placeholder}
                      </div>
                    )}
                  </Draggable>
                ))}
                {providedDroppable2.placeholder}
              </div>
            )}
          </Droppable>
          </Flex>
      </DragDropContext>
    );
  }

}
