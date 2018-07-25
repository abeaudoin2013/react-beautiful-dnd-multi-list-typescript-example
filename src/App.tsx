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
import './App.css';

interface Item {
  id: string;
  content: string;
}

interface IMoveResult {
  droppable: Item[];
  droppable2: Item[];
}

const getItems = (count: number, offset:number = 0): Item[] => {
  return Array
    .from({length: count}, (v, k) => k)
    .map(k => ({
      content: `item ${k + offset}`,
      id: `item-${k + offset}`
    }));
};

const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


/**
 * Moves an item from one list to another list.
 */
const move = (source: Item[], destination: Item[], droppableSource:DraggableLocation, droppableDestination:DraggableLocation):IMoveResult | any => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const grid:number = 8;

const getItemStyle = (draggableStyle: any, isDragging: any) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? 'lightgreen' : 'grey',
  ...draggableStyle
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250
});


interface IAppState {
  items: Item[];
  selected: Item[];
}

export default class App extends React.Component<{}, IAppState> {

  /**
   * A semi-generic way to handle multiple lists. Matches
   * the IDs of the droppable container to the names of the
   * source arrays stored in the state.
   */
  public id2List = {
    droppable: 'items',
    droppable2: 'selected'
  };

  constructor(props:any) {
    super(props);

    this.state = {
      items: getItems(10),
      selected: getItems(5, 10)
    };

    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
  }


  public getList (id:string) {
    return this.state[this.id2List[id]];
  }

  public onDragEnd(result: DropResult) {

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

      let state:IAppState = { items, selected:[] };

      if (source.droppableId === 'droppable2') {
        state = { ...state, selected: items };
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
        <Droppable droppableId="droppable">
          {(provided:DroppableProvided, snapshot:DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={getListStyle(snapshot.isDraggingOver)}
            >
              {this.state.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {// tslint:disable-next-line:no-shadowed-variable
                    (providedDraggable:DraggableProvided, snapshotDraggable:DraggableStateSnapshot) => (
                      <div>
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          style={getItemStyle(
                            providedDraggable.draggableProps.style,
                            snapshotDraggable.isDragging
                          )}
                        >
                          <span style={{backgroundColor: "blue"}} {...providedDraggable.dragHandleProps}>Drag meeee   </span>
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
        <Droppable droppableId="droppable2">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}>
              {this.state.selected.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id}
                  index={index}>
                  {// tslint:disable-next-line:no-shadowed-variable
                    (provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}>
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    );
  }

}
